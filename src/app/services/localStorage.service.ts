export class LocalStorage {

    uploadProfileKey:string = 'uploaded';

    constructor() {}

    // Add upload ID to local storage
    setUploaded(id) {
        let uploaded = this.getUploaded();

        if (!uploaded) {
            uploaded = [];
        }

        uploaded.push(id);
        localStorage.setItem(this.uploadProfileKey, JSON.stringify(uploaded));
    }

    // Retrieve upload IDs from local storage
    getUploaded() {
        return JSON.parse(localStorage.getItem(this.uploadProfileKey));
    }
}
