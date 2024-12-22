import fs from 'fs'
import path from 'path'
import {DatabaseEntery} from '../types/database'
import { logger } from '../utils/logger'

export class PersistenceManager{
    private dataFile: string
    private static instance: PersistenceManager
    private saveInsterval?: NodeJS.Timeout;

    private constructor(){
        this.dataFile = path.join(process.cwd(),'data', 'data.json')
        this.ensureFileExists()
        this.startAutoSave()
    }

    static getInstance(): PersistenceManager{
        if(!PersistenceManager.instance){
            PersistenceManager.instance = new PersistenceManager()
        }
        return PersistenceManager.instance
    }

    private ensureFileExists(): void{
        if(!fs.existsSync(path.dirname(this.dataFile))){
            fs.mkdirSync(path.dirname(this.dataFile), { recursive: true })
        }
    }

    private startAutoSave(): void{
        this.saveInsterval = setInterval(() => {
            this.saveToFile()
        }, 5000)
    }

    async saveToFile(data?:any) {
        try {
            await fs.promises.writeFile(this.dataFile, JSON.stringify(data, null, 2))
            logger.info('Data saved to file')
        }catch (error) {
            logger.error('Error saving data to file', error)
        }
    }

    async loadData(): Promise<any> {
        try {
            if(fs.existsSync(this.dataFile)){
                const data = await fs.promises.readFile(this.dataFile, 'utf-8')
                return JSON.parse(data)
            }

        }catch (error) {
            logger.error('Error loading data from file', error)
        }
        return null;
    }
    cleanup(){
        clearInterval(this.saveInsterval)
    }
}