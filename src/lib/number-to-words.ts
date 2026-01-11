
export function numberToWords(num: number): string {
    const a = [
        '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
        'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const regex = /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/;

    const getLT20 = (n: number) => a[Number(n)];
    const get20Plus = (n: number) => b[Number(n[0])] + ' ' + a[Number(n[1])];

    if (num === 0) return 'Zero';

    const process = (n: number): string => {
        if (n < 20) return getLT20(n);
        if (n < 100) return get20Plus(n.toString());
        if (n < 1000) return getLT20(Math.floor(n / 100)) + 'Hundred ' + process(n % 100);
        if (n < 100000) return process(Math.floor(n / 1000)) + 'Thousand ' + process(n % 1000);
        if (n < 10000000) return process(Math.floor(n / 100000)) + 'Lakh ' + process(n % 100000);
        return process(Math.floor(n / 10000000)) + 'Crore ' + process(n % 10000000);
    }

    return process(Math.floor(num)).trim();
}
