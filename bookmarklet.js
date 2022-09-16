(function() {

  'replaceme';

  // Check we're on an ATIP request page, or in test mode
  const possiblePages = ['atip-aiprp.tbs-sct.gc.ca', 'atip-aiprp.apps.gc.ca', 'localhost:8000'];

  if (!possiblePages.includes(window.location.host)) {
    alert('ATIPster error: This does not seem to be an ATIP requests page!')
    return;
  }

  // Set up pageType
  let pageType;

  if (window.location.host === 'atip-aiprp.tbs-sct.gc.ca') {
    pageType = 'tbs';
  }

  if (window.location.host === 'atip-aiprp.apps.gc.ca') {
    pageType = 'ircc';
  }

  if (window.location.host === 'localhost:8000') {
    if (document.title === 'Provide contact information - Access to Information and Personal Information Request Service - Canada.ca') {
      pageType = 'tbs';
    }
    if (document.title === 'Access to Information and Privacy (ATIP) Online Request') {
      pageType = 'ircc';
    }
  }

  if (!pageType) return;

  // Grab the data
  const atipsterData = window.atipsterData;

  if (!atipsterData) return;

  // Field mappings. Can't use template literals here because of bookmarklet weirdness, hence string concatenation
  const tbsFormFields = [
    { key: 'input#LastName', value: atipsterData.lastName },
    { key: 'input#FirstName', value: atipsterData.firstName },
    { key: 'input#BusinessOrgName', value: atipsterData.busName },
    { key: 'input#Address', value: atipsterData.streetNumber + ' ' + atipsterData.streetName },
    { key: 'input#ApartmentSuiteUnitNumber', value: atipsterData.aptNumber },
    { key: 'input#PostOfficeBox', value: atipsterData.poBox },
    { key: 'select#SelectedCountryId', value: 'Canada' }, // default
    { key: 'select#SelectedProvinceId', value: atipsterData.province },
    { key: 'input#City', value: atipsterData.city },
    { key: 'input#PostalCode', value: atipsterData.postal.replaceAll(' ', '') },
    { key: 'input#PhoneNumberCanUs', value: atipsterData.tel },
    { key: 'input#FaxNumberCanUs', value: atipsterData.fax },
    { key: 'fieldset.chkbxrdio-grp', value: atipsterData.requestor }
  ];

  const irccFormFields = [
    { key: 'select#citizenshipCategory', value: atipsterData.reqStatus },
    { key: 'input#familyName', value: atipsterData.lastName },
    { key: 'input#givenName', value: atipsterData.firstName },
    { key: 'input#address.streetNumber', value: atipsterData.streetNumber },
    { key: 'input#address.streetAddress1', value: atipsterData.streetName },
    { key: 'input#address.streetAddress2', value: atipsterData.busName },
    { key: 'input#address.apartmentNumber', value: atipsterData.aptNumber },
    { key: 'input#address.postOfficeBox', value: atipsterData.poBox },
    { key: 'input#address.city', value: atipsterData.city },
    { key: 'select#address.countryCode', value: 'Canada' }, // default
    { key: 'input#address.provinceOrState', value: atipsterData.province },
    { key: 'input#address.postalZipCode', value: atipsterData.postal },
    { key: 'input#telephone', value: atipsterData.tel },
    { key: 'input#fax', value: atipsterData.fax },
    { key: 'input#email', value: atipsterData.email },
    { key: 'input#confirmEmail', value: atipsterData.email },
    { key: 'select#ownBehalf', value: 'Yes' }, // default
    { key: 'select#descriptionCategory', value: atipsterData.requestor }, // requestor category
    { key: 'select#receiveMethod', value: atipsterData.delivery }
  ];

  // Grab proper form fields
  const formFields = pageType === 'ircc' ? irccFormFields : tbsFormFields;

  function setFieldset(fieldType, value) {
    const fieldOptions = {
      'Academia': 1,
      'Business (private sector)': 2,
      'Media': 3,
      'Organization': 4,
      'Member of the Public': 0,
      'Decline to Identify': 5
    };

    const checkboxes = document.querySelectorAll(fieldType + ' .radio input');
    checkboxes[fieldOptions[value]].checked = true;
  }

  function setSelect(element, value) {
    let valueToAssign = value;

    if (pageType === 'ircc') {
      const selectedDept = document.getElementById('department').selectedOptions[0].text;
      if (selectedDept === 'Immigration, Refugees and Citizenship Canada' && element.id === 'receiveMethod') {
        valueToAssign = 'E-mail';
      }
    }

    const optionsText = Array.from(element.options).map(d => d.text.toUpperCase());
    element.value = element.options[optionsText.indexOf(valueToAssign.toUpperCase())].value;
  }

  // Map over the fields and write to them
  formFields.map(entry => {
    const { key, value } = entry;

    const fieldType = key.replace(/#.+/, ''),
      elementId = key.replace(/^.+#/, ''),
      element = document.getElementById(elementId);

    switch (fieldType) {
      case 'input':
        element.value = value;
        break;
      case 'select':
        setSelect(element, value);
        break;
      case 'fieldset.chkbxrdio-grp':
        setFieldset(fieldType, value);
        break;
    }
  });

  const nextBtnSelector = pageType === 'ircc' ? '#btnContinueBottom' : '#contact-information-form > nav > button',
    nextBtn = document.querySelector(nextBtnSelector);

  // Scroll to next page button
  if (nextBtn.scrollIntoView) nextBtn.scrollIntoView({ behavior: 'smooth' });

})();
