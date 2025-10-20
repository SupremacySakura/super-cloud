import { Requester } from "../interfaces/Requester"

export class RequestCore {
    private requester: Requester
    constructor(requester: Requester) {
        this.requester = requester
    }
}


