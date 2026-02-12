//Функция для поиска коэффициента при любом множителе
const findCoefficient = (eqv, xString) => {
	const preparedEqv = eqv.replaceAll(' ', '');
	let xIndex = -1;
    let startSearch = 0;
	let foundCorrectX = false;

    while ((xIndex = preparedEqv.indexOf(xString, startSearch)) !== -1) {
        const nextChar = preparedEqv[xIndex + xString.length];
        if (nextChar === '+' || nextChar === '-' || nextChar === undefined) {
			foundCorrectX = true;
			break;
		}
		startSearch = xIndex + xString.length;
    }
    if (!foundCorrectX) {
		return 0;
	}
	const xPlus = preparedEqv.lastIndexOf('+', xIndex - 1);
	const xMinus = preparedEqv.lastIndexOf('-', xIndex - 1);
	const xStart = Math.max(xPlus, xMinus);

    let coefficient = preparedEqv.slice(xStart === -1 ? 0 : xStart, xIndex).trim();

	if (coefficient === "" || coefficient === "+") {
		return 1;
	}
    if (coefficient === "-") {
        return -1;
    }

	return Number(coefficient);
}

// Функция для получения всех коэффициентов уравнения
const getCoefficients = (eqv) => {
	return {
		a: findCoefficient(eqv, 'x^2'),
		b: findCoefficient(eqv, 'x'),
		c: eqv.replaceAll(' ', '').match(/(?:^|[+-])\d+(?=[+-]|$)/g) ? eqv.replaceAll(' ', '').match(/(?:^|[+-])\d+(?=[+-]|$)/g).map(Number).reduce((a,b) => a + b, 0) : 0
	}
}

// Функция НОД
const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        a %= b;
        [a, b] = [b, a];
    }
    return a;
};

// Функция НОД для массива чисел
const gcdOfArray = (numbers) => numbers.reduce((acc, curr) => gcd(acc, curr));

//Функция разделения корня на целую и иррациональную части, если это возможно
const simplifySquareRoot = (value) => {
	let coefficient = 1;
	let remainder = value;
	let largestSquare = Math.floor(Math.sqrt(value)) ** 2;
	while (largestSquare > 1) {
		if (value % largestSquare === 0) {
			coefficient *= Math.sqrt(largestSquare);
			remainder /= largestSquare;
			return { coefficient, remainder };
		}
		largestSquare = (Math.sqrt(largestSquare) - 1) ** 2;
	}
	return { coefficient, remainder };
}

// Основная функция для решения квадратного уравнения
const solveQuadraticEquation = (eqv) => {
	const { a, b, c } = getCoefficients(eqv);
	const discriminant = b**2 - 4*a*c;
	const discriminantSeparated = discriminant >= 0 ? simplifySquareRoot(discriminant) : simplifySquareRoot(discriminant/-1);
	const currentGCD = (discriminantSeparated.remainder === 1 && discriminant > 0) ? gcdOfArray([-b + discriminantSeparated.coefficient, 2*a]) : gcdOfArray([discriminantSeparated.coefficient, 2*a, -b]);
	const currentGCDForMinus = (discriminantSeparated.remainder === 1 && discriminant > 0) ? gcdOfArray([-b - discriminantSeparated.coefficient, 2*a]) : gcdOfArray([discriminantSeparated.coefficient, 2*a, -b]);

	if (discriminant > 0) {
		const root1 = discriminantSeparated.remainder === 1 ? `${(-b + discriminantSeparated.coefficient)/currentGCD}${(2*a)/currentGCD !== 1 ? ` / ${(2*a)/currentGCD}` : ''}` : `(${(-b)/currentGCD} + ${discriminantSeparated.coefficient/currentGCD !== 1 ? `${discriminantSeparated.coefficient/currentGCD}` : ''}√${discriminantSeparated.remainder})${(2*a)/currentGCD !== 1 ? ` / ${(2*a)/currentGCD}` : ''}`;
		const root2 = discriminantSeparated.remainder === 1 ? `${(-b - discriminantSeparated.coefficient)/currentGCDForMinus}${(2*a)/currentGCDForMinus !== 1 ? ` / ${(2*a)/currentGCDForMinus}` : ''}` : `(${(-b)/currentGCDForMinus} - ${discriminantSeparated.coefficient/currentGCDForMinus !== 1 ? `${discriminantSeparated.coefficient/currentGCDForMinus}` : ''}√${discriminantSeparated.remainder})${(2*a)/currentGCDForMinus !== 1 ? ` / ${(2*a)/currentGCDForMinus}` : ''}`;
		return `Уравнение имеет 2 действительных корня: ${root1} и ${root2}`;
	} else if (discriminant === 0) {
		const currentGCDForSingleRoot = gcd(-b, 2*a);
		const root = `${-b/currentGCDForSingleRoot}${(2*a)/currentGCDForSingleRoot !== 1 ? ` / ${(2*a)/currentGCDForSingleRoot}` : ''}`;
		return `Уравнение имеет 1 действительный корень: ${root}`;
	} else {
		const root1 = `(${(-b)/currentGCD} + ${discriminantSeparated.coefficient/currentGCD !== 1 ? `${discriminantSeparated.coefficient/currentGCD}i` : 'i'}${discriminantSeparated.remainder !== 1 ? `√${discriminantSeparated.remainder}` : ''})${(2*a)/currentGCD !== 1 ? ` / ${(2*a)/currentGCD}` : ''}`;
		const root2 = `(${(-b)/currentGCDForMinus} - ${discriminantSeparated.coefficient/currentGCDForMinus !== 1 ? `${discriminantSeparated.coefficient/currentGCDForMinus}i` : 'i'}${discriminantSeparated.remainder !== 1 ? `√${discriminantSeparated.remainder}` : ''})${(2*a)/currentGCDForMinus !== 1 ? ` / ${(2*a)/currentGCDForMinus}` : ''}`;
		return `Уравнение имеет 2 мнимых корня: ${root1} и ${root2}`;
	}
}

// Обработчик события для формы ввода уравнения
const equationForm = document.getElementById('equation-form');
const equationInput = document.getElementById('equation-input');
const resultText = document.getElementById('result-text');

equationForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const equation = equationInput.value;
	const result = solveQuadraticEquation(equation);
	resultText.textContent = result;
});
