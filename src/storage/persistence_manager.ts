import fs from 'fs'
import path from 'path'
import {DatabaseEntery} from '../types/database'
import { logger } from '../utils/logger'

export class PersistenceManager{
    private dataFile: string
    private static instance: PersistenceManager
    private saveInsterval?: NodeJS.Timeout;
    private currentData: any = null;

    private constructor(){
        this.dataFile = path.join(process.cwd(),'data', 'data.json')
        this.ensureFileExists()
        // this.startAutoSave()
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
        if(this.saveInsterval){
            clearInterval(this.saveInsterval)
        }
        this.saveInsterval = setInterval(() => {
            if(this.currentData !== null){
                this.saveToFile(this.currentData)
            }
        }, 5000)
    }

    async saveToFile(data?:any) {
        if(data === undefined || data === null){
            logger.info('No data to save')
            return;
        }
        try {
            this.currentData = data
            const serializedData = JSON.stringify(data, null, 2)
            await fs.promises.writeFile(this.dataFile, JSON.stringify(serializedData, null, 2))
            logger.info('Data saved to file')
        }catch (error) {
            logger.error('Error saving data to file', error)
            throw error
        }
    }

    async loadData(): Promise<any> {
        try {
            if(fs.existsSync(this.dataFile)){
                const data = await fs.promises.readFile(this.dataFile, 'utf-8')
                this.startAutoSave()
                return JSON.parse(data)
            }

        }catch (error) {
            logger.error('Error loading data from file', error)
        }
        return null;
    }
    cleanup(){
        if(this.saveInsterval){

            clearInterval(this.saveInsterval)
            this.saveInsterval = undefined
        }
    }
}