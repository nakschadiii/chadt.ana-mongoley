import { profileSchema } from "./schema/profile";
import { aliasSchema } from "./schema/alias";
import { getProfile } from "./api/getProfile";
import { setProfile } from "./api/setProfile";
import { setAlias } from "./api/setAlias";

interface constructor {
    withAliases: boolean;
    connections: {
        profiles: any;
    },
}

export default class {
    private connections: any;
    private models: any;
    private withAliases: boolean;

    getProfile: any;
    setProfile: any;
    setAlias: any;

    constructor({ connections, withAliases = true }: constructor) {
        this.withAliases = withAliases;
        this.connections = connections;
        this.models = {};
        this.models.profile = this.connections.profiles.model("users", profileSchema);
        if (this.withAliases) this.models.alias = this.connections.profiles.model("alias", aliasSchema);

        this.getProfile = getProfile.bind(this);
        this.setProfile = setProfile.bind(this);
        if (this.withAliases) this.setAlias = setAlias.bind(this);
    }
}

