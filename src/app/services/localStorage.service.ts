export class LocalStorage {

    uploadProfileKey:string = 'uploaded';

    constructor() {}

    // Add upload ID to local storage
    SetUploaded(id) {
        let uploaded = this.GetUploaded();

        if (!uploaded) {
            uploaded = [];
        }

        uploaded.push(id);
        localStorage.setItem(this.uploadProfileKey, JSON.stringify(uploaded));
    }

    // Retrieve upload IDs from local storage
    GetUploaded() {
        return JSON.parse(localStorage.getItem(this.uploadProfileKey));
    }
}
