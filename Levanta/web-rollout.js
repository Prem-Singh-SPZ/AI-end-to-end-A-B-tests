(function() {
    var inputFieldName = '0-1/cro1'; // HubSpot hidden field name
    var inputFieldSelector = 'input[name="' + inputFieldName + '"]'; // change selector as per your hidden field
    /***********************************
    ************************************
    DO NOT TOUCH
    BEYOND THIS LINE
    ******************************
    ******************************/
    console.log('init Down funnel');

    function getCookieForHiddenValue(name) {
        var nameEQ = name + "=";
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var c = cookies[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length);
            }
        }
        return null;
    }

    function getFinalValue() {
        var squeezePageValue = (window.squeezePageValue !== undefined) ? window.squeezePageValue : "";
        var landingPageValue = getCookieForHiddenValue("ExperimentValue") || "";
        var finalList = landingPageValue ? landingPageValue.split(",") : [];

        if (squeezePageValue) {
            finalList = finalList.filter(function (v) { return v !== squeezePageValue; });
            finalList.push(squeezePageValue);
        }

        return finalList.join(",");
    }

    function applyToForm(form, finalValue) {
        if (!form || !finalValue) return false;
        try {
            form.setFieldValue(inputFieldName, finalValue);
            return true;
        } catch (e) {
            return false;
        }
    }

    function setHiddenField() {
        var finalValue = getFinalValue();
        if (!finalValue) return;

        var applied = false;

        if (window.HubSpotFormsV4 && typeof window.HubSpotFormsV4.getForms === 'function') {
            var forms = window.HubSpotFormsV4.getForms() || [];
            for (var i = 0; i < forms.length; i++) {
                if (applyToForm(forms[i], finalValue)) applied = true;
            }
        }

        var fields = document.querySelectorAll(inputFieldSelector);
        for (var j = 0; j < fields.length; j++) {
            fields[j].value = finalValue;
            applied = true;
        }

        if (applied) console.log('Down funnel value set');
    }

    window.addEventListener('hs-form-event:on-ready', function (event) {
        if (!window.HubSpotFormsV4 || typeof window.HubSpotFormsV4.getFormFromEvent !== 'function') return;
        var form = window.HubSpotFormsV4.getFormFromEvent(event);
        applyToForm(form, getFinalValue());
    });

    var attempts = 0;
    var setHiddenFieldInterval = setInterval(function () {
        setHiddenField();

        if (attempts >= 14) {
            clearInterval(setHiddenFieldInterval);
        }
        attempts++;
    }, 1000);
}());
