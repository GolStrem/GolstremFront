function Capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export default Capitalize;