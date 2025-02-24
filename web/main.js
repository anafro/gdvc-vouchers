window.addEventListener("beforeunload", () => { eel.close_python()} )

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

async function loadFonts() {
    const fonts = [
        {
            name: 'Zvezda',
            filename: 'zvezda.ttf',
        },
        {
            name: 'Montserrat',
            filename: 'montserrat.ttf',
        },
    ];

    const fontPromises = fonts.map(font => {
        const fontFace = new FontFace(font.name, `url(/fonts/${font.filename})`);
        document.fonts.add(fontFace);
        return fontFace.load();
    });

    await Promise.all(fontPromises);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (error) => reject('Image failed to load: ' + error);
        image.src = src;
    });
}

async function generateCertificateImage(certificate) {
    const cyan = '#00D5BA';
    const black = '#000000';

    try {
        await loadFonts();
        const template = await loadImage('images/certificate.png');

        // Check if image loaded correctly
        if (!template.width || !template.height) {
            console.error("Image not loaded correctly.");
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = template.width;
        canvas.height = template.height;

        context.drawImage(template, 0, 0, canvas.width, canvas.height);

        context.fillStyle = black;
        context.font = `1000 32px Montserrat`;
        context.fillText(`#${certificate.id}`, 988, 105);

        context.fillStyle = cyan;
        context.font = `280px Zvezda`;
        context.fillText(certificate.value, 978, 526);

        context.fillStyle = cyan;
        context.font = `84px Zvezda`;
        context.fillText('рублей', 978, 623);

        context.fillStyle = cyan;
        context.font = `bold 48px Montserrat`;
        context.fillText(`На услугу "${certificate.service}"`, 978, 693);

        context.fillStyle = black;
        context.font = `bold 24px Montserrat`;
        context.fillText(`Этот сертификат действителен до ${new Date(certificate.expires).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })}. Поторопитесь!`, 978, 891);

        context.fillStyle = '#B3B3B3';
        context.font = `bold 24px Montserrat`;
        context.fillText(`Владелец: ${certificate.holder}`, 978, 960);

        const image = document.getElementById(`certificates__card-options-certificate-${certificate.id}`);
        const base64 = canvas.toDataURL("image/png");

        image.src = base64;
    } catch (error) {
        console.error("Error generating certificate image:", error);
    }
}