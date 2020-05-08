export class LocalStorage {

    constructor() {}

    // Add upload ID to local storage
    SetUploaded(id) {
        let uploaded = this.GetUploaded();

        if (!uploaded) {
            uploaded = [];
        }

        uploaded.push(id);
        localStorage.setItem('uploaded', JSON.stringify(uploaded));
    }

    // Retrieve upload IDs from local storage
    GetUploaded() {
        return JSON.parse(localStorage.getItem('uploaded'));
    }
}
