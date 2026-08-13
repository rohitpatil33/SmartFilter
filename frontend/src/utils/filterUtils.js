export function detectColumnType(rows, column) {

    const values = rows
        .map((row) => row[column])
        .filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
        );

    if (values.length === 0) {
        return "text";
    }

    const isNumber = values.every((value) => {
        return !isNaN(Number(value));
    });

    if (isNumber) {
        return "number";
    }

    const isDate = values.every((value) => {
        const date = new Date(value);

        return !isNaN(date.getTime());
    });

    if (isDate) {
        return "date";
    }

    const uniqueValues = new Set(
        values.map((value) =>
            String(value).toLowerCase().trim()
        )
    );

    /*
     * If a column has relatively few unique values,
     * treat it as a category.
     */
    if (
        uniqueValues.size <= 20 &&
        uniqueValues.size < values.length * 0.5
    ) {
        return "category";
    }

    return "text";
}