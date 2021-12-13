window.addEventListener('load', function () {
    const formEl = document.querySelector('form')
    const fileInputComponent = document.getElementById('file-input-component')
    const fileInputEl = document.querySelector('input[name="my-file"]');
    const fileInputLabel = document.getElementById('file-name');
    const descriptionInputEl = document.querySelector('textarea[name="my-description"]');
    const passwordInputEl = document.querySelector('input[type=password')
    const submitBtn = document.querySelector('button[type=submit]');
    const hostedLinkEl = document.getElementById('hosted-link');
    /** * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * when a media file is uploaded, the type (or mimetype)
     * of the file will have the value
     * '<type>/<file-extention>'
     * 
     * ex: 'image/png', 'audio/mp3', 'video/mp4'
     * ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 
     * by using the object keys 'audio', 'image', 'video'
     * we can easily access a property with the type text
     * 
     * ex: mediaType['image'] (targets the image element)
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    const mediaType = {
        audio: document.getElementById('audio-preview'),
        image: document.getElementById('image-preview'),
        video: document.getElementById('video-preview')
    };

    let myFile;

    const displaySelectedFileName = (name) => fileInputLabel.innerText = name
    const collectFormData = (myFile) => {
        const formData = new FormData();
        const description = descriptionInputEl.value; // capture a value from form input
        formData.append('myFile', myFile);
        formData.append('description', description);
        return formData
    }
    const validateForm = (file, password) => {
        if (!file) {
            fileInputComponent.classList.add('is-danger')
            submitBtn.setAttribute('disabled', true);
            return false
        }
        if (!password) {
            submitBtn.setAttribute('disabled', true);
            submitBtn.classList.add('is-danger')
            submitBtn.removeAttribute('disabled');
            return false
        }
        fileInputComponent.classList.remove('is-danger')
        fileInputComponent.classList.add('is-success')

        submitBtn.classList.remove('is-danger')
        submitBtn.classList.add('is-success')

        return true
    }
    const toggleLoading = () => submitBtn.classList.toggle('is-loading')
    const loadResults = (type, url) => {
        mediaType[type].setAttribute('src', url);
        displayMediaContent(mediaType[type]);
        hostedLinkEl.setAttribute('href', url);
        hostedLinkEl.innerText = `${type} is now hosted here`;
        type !== 'image' && mediaType[type].setAttribute('controls', null);
    };
    const displayMediaContent = (element) => element.classList.toggle("is-hidden");
    const resetPage = () => {
        fileInputEl.value = ''; // clear file input
        passwordInputEl.value = '';
        descriptionInputEl.value = ''; // reset displayed text 
        submitBtn.setAttribute('disabled', true); // disable submit btn
        hostedLinkEl.innerText = ''; // reset link text
        displaySelectedFileName(''); // remove file name
        resetMediaElements();
    };
    const resetMediaElements = () => {
        Object.keys(mediaType).forEach(type => {
            mediaType[type].src = ''
            mediaType[type].removeAttribute('controls')
        });
    };

    passwordInputEl.addEventListener('input', ({ target }) => {
        if (!validateForm(myFile, target.value)) return
    })
    fileInputEl.addEventListener('change', ({ target }) => {
        if (!target.files || !target.files[0]) return
        myFile = target.files[0];
        // console.log(myFile);
        displaySelectedFileName(myFile.name);

        const type = myFile.type.split('/')[0];
        resetMediaElements();
        mediaType[type].src = URL.createObjectURL(myFile); // set element src to blob url
        mediaType[type].setAttribute('controls', null);
        type === 'video' && mediaType[type].setAttribute('type', myFile.type);
        displayMediaContent(mediaType[type]);

        const reader = new FileReader();
        reader.readAsDataURL(myFile);
        reader.onloadend = () => validateForm(myFile, passwordInputEl.value)
    });


    formEl.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (!validateForm(myFile, passwordInputEl.value)) return
        toggleLoading()
        const formData = collectFormData(myFile)

        try {
            const data = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `bearer ${passwordInputEl.value}`
                },
                body: formData
            }).then(res => res.status === 200 ? res.json() : null)
            // console.log(data)
            if (!data) {
                // handle unauathorized
                resetPage();
                toggleLoading()
                hostedLinkEl.innerText = `something went wrong, please try again`;

                return console.log('unauthorized')
            }
            resetPage()
            const { mimetype, url } = data;
            loadResults(mimetype.split('/')[0], url);
            toggleLoading();

        } catch (error) {
            console.error(error);
            toggleLoading();
        }
    })

});