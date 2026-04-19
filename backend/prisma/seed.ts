import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/config/prismaClient';

type RawExercise = {
  id: string;
  name: string;
  category?: string | null;
  body_part?: string | null;
  equipment?: string | null;
  instructions?: {
    en?: string | null;
  } | null;
  instruction_steps?: {
    en?: string[] | null;
  } | null;
  muscle_group?: string | null;
  secondary_muscles?: string[] | null;
  target?: string | null;
  image?: string | null;
  gif_url?: string | null;
  created_at?: string | null;
};

const resolveExerciseDataPath = (): string => {
  const candidatePaths = [
    process.env.EXERCISE_DATA_PATH,
    path.resolve(__dirname, '../../frontend/src/constants/exercise-data.json'),
    path.resolve(__dirname, './data/exercise-data.json'),
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  const foundPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));
  if (!foundPath) {
    throw new Error(`Exercise data file not found. Checked: ${candidatePaths.join(', ')}`);
  }

  return foundPath;
};

const exerciseDataPath = resolveExerciseDataPath();
const rawExercises = JSON.parse(fs.readFileSync(exerciseDataPath, 'utf8')) as RawExercise[];

const normalizeText = (value?: string | null): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : null;
};

const normalizeList = (values?: Array<string | null> | null): string[] => {
  if (!Array.isArray(values)) return [];
  const normalized = values.map((value) => normalizeText(value)).filter((value): value is string => Boolean(value));
  return normalized.filter((value, index) => normalized.indexOf(value) === index);
};

const normalizeSteps = (values?: Array<string | null> | null): string[] => {
  if (!Array.isArray(values)) return [];
  return values.map((value) => normalizeText(value)).filter((value): value is string => Boolean(value));
};

const parseDate = (value?: string | null): Date | null => {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const main = async () => {
  const equipmentNames = rawExercises
    .map((exercise) => normalizeText(exercise.equipment))
    .filter((value): value is string => Boolean(value))
    .filter((value, index, items) => items.indexOf(value) === index);

  const muscleGroupNames = rawExercises
    .flatMap((exercise) => normalizeList([exercise.target, exercise.muscle_group, ...(exercise.secondary_muscles ?? [])]))
    .filter((value, index, items) => items.indexOf(value) === index);

  if (equipmentNames.length) {
    await prisma.equipment.createMany({
      data: equipmentNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  if (muscleGroupNames.length) {
    await prisma.muscleGroup.createMany({
      data: muscleGroupNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  const [equipmentRows, muscleGroupRows] = await Promise.all([
    equipmentNames.length ? prisma.equipment.findMany({ where: { name: { in: equipmentNames } } }) : Promise.resolve([]),
    muscleGroupNames.length ? prisma.muscleGroup.findMany({ where: { name: { in: muscleGroupNames } } }) : Promise.resolve([]),
  ]);

  const equipmentByName = new Map(equipmentRows.map((equipment) => [equipment.name, equipment.equipment_id]));
  const muscleGroupByName = new Map(muscleGroupRows.map((muscleGroup) => [muscleGroup.name, muscleGroup.id]));

  const upsertedExercises = [];

  for (const exercise of rawExercises) {
    const equipmentName = normalizeText(exercise.equipment);
    const equipmentId = equipmentName ? equipmentByName.get(equipmentName) ?? null : null;

    const record = await prisma.exercise.upsert({
      where: { external_id: exercise.id },
      create: {
        external_id: exercise.id,
        name: exercise.name,
        category: normalizeText(exercise.category),
        body_part: normalizeText(exercise.body_part),
        equipment_id: equipmentId,
        created_at: parseDate(exercise.created_at),
        gif_url: normalizeText(exercise.gif_url),
        image: normalizeText(exercise.image),
        instructions_en: normalizeText(exercise.instructions?.en),
        instruction_steps_en: normalizeSteps(exercise.instruction_steps?.en),
      },
      update: {
        name: exercise.name,
        category: normalizeText(exercise.category),
        body_part: normalizeText(exercise.body_part),
        equipment_id: equipmentId,
        created_at: parseDate(exercise.created_at),
        gif_url: normalizeText(exercise.gif_url),
        image: normalizeText(exercise.image),
        instructions_en: normalizeText(exercise.instructions?.en),
        instruction_steps_en: normalizeSteps(exercise.instruction_steps?.en),
      },
    });

    upsertedExercises.push({
      exerciseId: record.exercise_id,
      muscleGroups: normalizeList([exercise.target, exercise.muscle_group, ...(exercise.secondary_muscles ?? [])]),
    });
  }

  const seededExerciseIds = upsertedExercises.map((entry) => entry.exerciseId);
  if (seededExerciseIds.length) {
    await prisma.exerciseToMuscleGroup.deleteMany({
      where: {
        A: { in: seededExerciseIds },
      },
    });
  }

  const relationRows = upsertedExercises.flatMap((entry) =>
    entry.muscleGroups
      .map((muscleGroupName) => muscleGroupByName.get(muscleGroupName))
      .filter((muscleGroupId): muscleGroupId is number => typeof muscleGroupId === 'number')
      .map((muscleGroupId) => ({ A: entry.exerciseId, B: muscleGroupId })),
  );

  for (const relationBatch of chunk(relationRows, 1000)) {
    if (!relationBatch.length) continue;
    await prisma.exerciseToMuscleGroup.createMany({
      data: relationBatch,
      skipDuplicates: false,
    });
  }

  console.log(`Seeded ${upsertedExercises.length} exercises, ${equipmentNames.length} equipment rows, ${muscleGroupNames.length} muscle groups, and ${relationRows.length} exercise-muscle links.`);
};

main()
  .catch((error) => {
    console.error('Exercise seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
