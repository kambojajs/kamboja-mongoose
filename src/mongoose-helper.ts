import { Core, Kamboja } from "kamboja"
import * as Mongoose from "mongoose"
import { SchemaGenerator } from "./schema-generator"
import * as H from "./helper"
import * as Kecubung from "kecubung"
import { OptionBuilder } from "./option-builder"

export class MongooseHelper {
    private static instance: MongooseHelper
    schemas: { [key: string]: Mongoose.Schema } = {}

    static getInstance() {
        if (!MongooseHelper.instance) {
            let facade = Kamboja.getFacade();
            if (!facade) throw new Error("Instance of Kamboja not found, do setup after Kamboja instantiation")
            MongooseHelper.instance = new MongooseHelper(facade.pathResolver,
                facade.metaDataStorage.getClasses("Model"))
        }
        return MongooseHelper.instance
    }

    constructor(private pathResolver: Core.PathResolver, classes: Core.QualifiedClassMetaData[]) {
        this.init(classes)
    }

    createModel<T>(name: string) {
        return Mongoose.model<T & Mongoose.Document>(name, this.schemas[name])
    }

    private init(classes: Core.QualifiedClassMetaData[]) {
        let generator = new SchemaGenerator(this.pathResolver)
        let optionBuilder = new OptionBuilder()
            classes.forEach(x => {
                let schema = generator.generate(x)
                let option = optionBuilder.getOption(x)
                this.schemas[H.getName(x.name)] = new Mongoose.Schema(schema, option)
            })
    }


}