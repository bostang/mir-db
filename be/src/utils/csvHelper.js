const convertToCsv = (data) => {
    if (!data || data.length === 0) return '';
    const header = Object.keys(data[0]).join(',') + '\n';
    const body = data.map(row => Object.values(row).map(value => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Tangani karakter khusus dan koma
        return stringValue.includes(',') || stringValue.includes('"') 
            ? `"${stringValue.replace(/"/g, '""')}"` 
            : stringValue;
    }).join(',')).join('\n');
    return header + body;
};

module.exports = { convertToCsv };