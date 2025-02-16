function app() {
    return {
        certificates: [],
        searchQuery: '',
        holder: '',
        phone: '',
        service: 'dry-cleaning',
        open: false,

        async init() {
            this.certificates = await getCertificates();
        },

        get filteredCertificates() {
            const search = this.searchQuery.trim();

            const isIdSearch = search.startsWith('#');
            const searchId = isIdSearch ? parseInt(search.substring(1)) : null;

            return this.certificates.filter(cert => {
                const id = parseInt(cert.id);

                if ((isIdSearch && searchId && id === searchId) || id.toString().includes(search)) {
                    return true;
                }

                return !isIdSearch && (
                    cert.holder.toLowerCase().includes(search.toLowerCase()) ||
                    cert.phone.includes(search)
                );
            });
        }
    };
}

async function getCertificates() {
    if (typeof window["eel"] === "undefined") {
        console.error("%cThe EEL is not defined. Don't run the script in the browser!", "font-size: 1.5rem; font-weight: 1000;");
        return [];
    }

    return await eel["get_certificates"]()();
}

async function createCertificate(holder, phone, service) {
    if (typeof window["eel"] === "undefined") {
        console.error("%cThe EEL is not defined. Don't run the script in the browser!", "font-size: 1.5rem; font-weight: 1000;");
        return;
    }

    await eel["create_certificate"](holder, phone, service)();
}

async function deleteCertificate(id) {
    if (typeof window["eel"] === "undefined") {
        console.error("%cThe EEL is not defined. Don't run the script in the browser!", "font-size: 1.5rem; font-weight: 1000;");
        return;
    }

    await eel["delete_certificate"](parseInt(id))();
}