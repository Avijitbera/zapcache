import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger';

export class Persistence {
  private readonly dataFile: string;

  constructor() {
    this.dataFile = join(process.cwd(), 'data', 'db.json');
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory() {
    const dir = join(process.cwd(), 'data');
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create data directory:', error);
    }
  }

  async save(data: any): Promise<void> {
    try {
      await writeFile(
        this.dataFile,
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      logger.error('Failed to save data:', error);
      throw error;
    }
  }

  async load(): Promise<any> {
    try {
      const data = await readFile(this.dataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        logger.error('Failed to load data:', error);
      }
      return null;
    }
  }
}