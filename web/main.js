function getCertificates() {
    if (typeof window["eel"] === "undefined") {
        console.error("%cThe EEL is not defined. Don't run the script in the browser!", "font-size: 1.5rem; font-weight: 1000;");
        return [];
    }

    return eel["get_certificates"]();
}

function createCertificate(holder, phone, service) {
    if (typeof window["eel"] === "undefined") {
        console.error("%cThe EEL is not defined. Don't run the script in the browser!", "font-size: 1.5rem; font-weight: 1000;");
        return;
    }

    eel["create_certificate"](holder, phone, service);
}