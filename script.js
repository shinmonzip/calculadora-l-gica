// Função principal da calculadora lógica
function calcularFormula(formula, valores) {
    if (!analisadorLexico(formula)) {
      return { erro: "Erro: Símbolos inválidos" };
    }
    if (!analisadorSintatico(formula)) {
      return { erro: "Erro: Fórmula mal formulada" };
    }
    try {
      const resultado = avaliarFormula(formula, valores);
      return { resultado: resultado ? "V" : "F" };
    } catch (e) {
      return { erro: "Erro ao calcular" };
    }
  }
  
  // Análise Léxica
  function analisadorLexico(formula) {
    const simbolosValidos = ["A", "B", "C", "P", "Q", "R", "S", "T", "∼", "^", "v", "→", "↔", "(", ")", " "];
    for (let char of formula) {
      if (!simbolosValidos.includes(char)) return false;
    }
    return true;
  }
  
  // Análise Sintática (simplificada)
  function analisadorSintatico(formula) {
    formula = formula.replace(/\s/g, "");
    let pilha = [];
    for (let char of formula) {
      if (char === "(") pilha.push(char);
      if (char === ")") {
        if (pilha.length === 0) return false;
        pilha.pop();
      }
    }
    if (pilha.length !== 0) return false;
  
    const operadoresBinarios = ["^", "v", "→", "↔"];
    for (let i = 0; i < formula.length; i++) {
      if (operadoresBinarios.includes(formula[i])) {
        if (i === 0 || i === formula.length - 1) return false;
        if (formula[i - 1] === "(" || formula[i + 1] === ")") return false;
      }
    }
    return true;
  }
  
  // Avaliação da Fórmula
  function avaliarFormula(formula, valores) {
    formula = formula.replace(/\s/g, "");
  
    // Avaliar subfórmulas dentro de parênteses
    while (formula.includes("(")) {
      let inicio = formula.lastIndexOf("(");
      let fim = formula.indexOf(")", inicio);
      if (fim === -1) throw new Error("Parênteses não balanceados");
      let subFormula = formula.slice(inicio + 1, fim);
      let valorSubFormula = avaliarExpressao(subFormula, valores);
      formula = formula.slice(0, inicio) + (valorSubFormula ? "T" : "F") + formula.slice(fim + 1);
    }
  
    return avaliarExpressao(formula, valores);
  }
  
  // Avaliar expressão sem parênteses
  function avaliarExpressao(expr, valores) {
    let partes = [];
    let temp = "";
    for (let i = 0; i < expr.length; i++) {
      if (["∼", "^", "v", "→", "↔"].includes(expr[i])) {
        if (temp) partes.push(temp);
        partes.push(expr[i]);
        temp = "";
      } else {
        temp += expr[i];
      }
    }
    if (temp) partes.push(temp);
  
    // Avaliar negações primeiro
    for (let i = 0; i < partes.length; i++) {
      if (partes[i] === "∼" && i + 1 < partes.length) {
        let valor = partes[i + 1] === "T" ? true : valores[partes[i + 1]];
        partes.splice(i, 2, !valor);
      }
    }
  
    // Avaliar operadores binários (da esquerda para direita)
    for (let operador of ["^", "v", "→", "↔"]) {
      for (let i = 0; i < partes.length; i++) {
        if (partes[i] === operador) {
          let esq = partes[i - 1] === "T" ? true : partes[i - 1] === "F" ? false : valores[partes[i - 1]];
          let dir = partes[i + 1] === "T" ? true : partes[i + 1] === "F" ? false : valores[partes[i + 1]];
          let resultado;
          switch (operador) {
            case "^": resultado = esq && dir; break;
            case "v": resultado = esq || dir; break;
            case "→": resultado = !esq || dir; break;
            case "↔": resultado = esq === dir; break;
          }
          partes.splice(i - 1, 3, resultado);
          i -= 2;
        }
      }
    }
  
    return partes[0];
  }