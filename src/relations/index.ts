import { getRelations } from "./api/getRelations";
import { setRelation } from "./api/setRelation";
import { relationsSchema } from "./schemas/relations.schema";

export default class {
    connections: any;
    models: any;

    constructor({ connections }: any) {
        this.connections = connections;
        this.models = {
            relations: connections.relations.model("relations", relationsSchema),
        };

        this.getRelations = getRelations.bind(this);
        this.setRelation = setRelation.bind(this);
    }
}