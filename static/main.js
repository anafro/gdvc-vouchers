function app() {
    return exposeGlobally({
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
    }, 'app');
}

async function getCertificates() {
    const response = await fetch('/api/v1/get_certificates');
    if (response.ok) {
        return await response.json();
    } else {
        console.error('Failed to fetch certificates:', response.statusText);
    }
}

async function createCertificate(holder, phone, service) {
    console.log({holder, phone, service});

    const response = await fetch('/api/v1/create_certificate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            holder: holder,
            phone: phone,
            service_type: service,
        }),
    });

    const responseBody = await response.json();  // This will capture the detailed error message

    if (response.ok) {
        console.log("Certificate created successfully!");
    } else {
        console.error("Failed to create certificate:", response.statusText);
        console.error("Response details:", responseBody);  // Logs the error message from FastAPI
    }
}

async function deleteCertificate(id) {
    await fetch(`/api/v1/delete_certificate?id=${id}`, {
        method: 'DELETE'
    });
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
        const fontFace = new FontFace(font.name, `url(/static/fonts/${font.filename})`);
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
        const template = await loadImage('/static/images/certificate.png');

        // Check if image loaded correctly
        if (!template.width || !template.height) {
            console.error("Image not loaded correctly.");
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const isPercentageOff = certificate.service.startsWith('%')
        const certificateService = certificate.service.replaceAll('%', '');
        canvas.width = template.width;
        canvas.height = template.height;

        context.drawImage(template, 0, 0, canvas.width, canvas.height);

        context.fillStyle = black;
        context.font = `1000 32px Montserrat`;
        context.fillText(`#${certificate.id}`, 988, 105);

        context.fillStyle = cyan;
        context.font = `280px Zvezda`;
        context.fillText(certificate.is_percents ? certificate.value + '%' : certificate.value, 978, 526);

        context.fillStyle = cyan;
        context.font = `84px Zvezda`;
        context.fillText(certificate.is_percents ? 'скидка' : 'рублей', 978, 623);

        context.fillStyle = cyan;
        context.font = `bold 48px Montserrat`;
        context.fillText(`На услугу "${certificate.service}"`, 978, 693);

        context.fillStyle = black;
        context.font = `bold 24px Montserrat`;
        context.fillText(`Сертификат действителен до ${new Date(certificate.expires).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })}`, 978, 891);

        context.fillStyle = '#B3B3B3';
        context.font = `bold 24px Montserrat`;
        context.fillText(`Владелец: ${certificate.holder}, ${certificate.phone}`, 978, 960);

        const image = document.getElementById(`certificates__card-options-certificate-${certificate.id}`);

        image.src = canvas.toDataURL("image/png");
    } catch (error) {
        console.error("Error generating certificate image:", error);
    }
}

function exposeGlobally(object, variableName) {
    window[variableName] = object;
    return object;
}

async function isTokenCorrect(token) {
    const response = await fetch('/api/v1/first_access?token=' + token, {
        method: 'GET',
    });

    return response.ok;
}