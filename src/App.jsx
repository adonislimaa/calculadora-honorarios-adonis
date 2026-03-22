import React, { useMemo, useRef, useState } from "react";

function moeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function numero(v) {
  if (typeof v === "number") return v;

  const limpo = String(v || "")
    .replace(/R\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");

  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : 0;
}

function formatarMoedaInput(valor) {
  const apenasDigitos = String(valor || "").replace(/\D/g, "");
  if (!apenasDigitos) return "";

  const valorNumerico = Number(apenasDigitos) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorNumerico);
}

function normalizarPercentualInteiro(valor) {
  const apenasDigitos = String(valor || "").replace(/\D/g, "");
  if (!apenasDigitos) return "";
  return String(Math.min(Number(apenasDigitos), 100));
}

function normalizarQuantidade(valor) {
  const apenasDigitos = String(valor || "").replace(/\D/g, "");
  if (!apenasDigitos) return "";
  return String(Number(apenasDigitos));
}

function normalizarPercentualImposto(valor) {
  let limpo = String(valor || "")
    .replace(/[^\d,]/g, "")
    .replace(/(,.*),/g, "$1");

  if (!limpo) return "";

  const numeroConvertido = parseFloat(limpo.replace(",", "."));
  if (!Number.isNaN(numeroConvertido) && numeroConvertido > 100) {
    return "100";
  }

  return limpo;
}

function selecionarTextoElemento(elemento) {
  if (!elemento || typeof window === "undefined" || typeof document === "undefined") return;

  const selection = window.getSelection?.();
  const range = document.createRange?.();
  if (!selection || !range) return;

  selection.removeAllRanges();
  range.selectNodeContents(elemento);
  selection.addRange(range);
}

async function copiarTextoSeguro(texto, elementoFallback = null) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { ok: false, message: "Ambiente sem acesso ao clipboard." };
  }

  const clipboardDisponivel =
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function" &&
    window.isSecureContext;

  if (clipboardDisponivel) {
    try {
      await navigator.clipboard.writeText(texto);
      return { ok: true, message: "Resumo copiado com sucesso." };
    } catch {
      // segue para fallback
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copiado = typeof document.execCommand === "function" ? document.execCommand("copy") : false;
    document.body.removeChild(textarea);

    if (copiado) {
      return { ok: true, message: "Resumo copiado com sucesso." };
    }
  } catch {
    // segue para seleção manual
  }

  if (elementoFallback) {
    selecionarTextoElemento(elementoFallback);
    return {
      ok: false,
      message: "Seu navegador bloqueou a cópia automática. O texto abaixo foi selecionado para cópia manual.",
    };
  }

  return {
    ok: false,
    message: "Seu navegador bloqueou a cópia automática. Copie manualmente o texto exibido abaixo.",
  };
}

function executarTestesInternos() {
  const testes = [
    numero("R$ 1.234,56") === 1234.56,
    normalizarPercentualInteiro("150") === "100",
    normalizarQuantidade("03abc") === "3",
    normalizarPercentualImposto("4,5") === "4,5",
    formatarMoedaInput("123456") === "R$ 1.234,56" || formatarMoedaInput("123456") === "R$ 1.234,56",
  ];

  return testes.every(Boolean);
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #f8fafc 0%, #eef2f7 45%, #e2e8f0 100%)",
    padding: 16,
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#0f172a",
  },
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  hero: {
    overflow: "hidden",
    borderRadius: 32,
    border: "1px solid #e2e8f0",
    background: "#fff",
    boxShadow: "0 20px 40px rgba(148, 163, 184, 0.15)",
  },
  heroTopo: {
    padding: "24px 32px",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)",
    color: "#fff",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
  },
  marcaBox: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  iconeMarca: {
    width: 56,
    height: 56,
    borderRadius: 20,
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
  },
  botoesTopo: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  botaoBase: {
    border: 0,
    borderRadius: 16,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  botaoEscuro: {
    background: "#0f172a",
    color: "#fff",
  },
  botaoClaro: {
    background: "#fff",
    color: "#0f172a",
  },
  abasWrap: {
    display: "grid",
    gap: 8,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  aba: {
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    background: "#fff",
    padding: "14px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  abaAtiva: {
    background: "#0f172a",
    color: "#fff",
    border: "1px solid #0f172a",
  },
  gridPrincipal: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "1.2fr 1fr",
  },
  coluna: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  card: {
    borderRadius: 28,
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.04)",
  },
  cardHeader: {
    padding: "24px 24px 0",
  },
  cardContent: {
    padding: 24,
  },
  formGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  campoWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  ajuda: {
    fontSize: 11,
    color: "#94a3b8",
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    height: 44,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: "0 14px",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
  },
  sufixo: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: 14,
  },
  resumoGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  resumoCard: {
    borderRadius: 24,
    border: "1px solid #e2e8f0",
    background: "#fff",
    padding: 20,
  },
  resumoCardDark: {
    borderRadius: 24,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    padding: 20,
  },
  detalheGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "1fr 1fr",
  },
  detalheBox: {
    borderRadius: 24,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: 16,
  },
  memoriaBox: {
    borderRadius: 24,
    border: "1px solid #e2e8f0",
    background: "#fff",
    padding: 16,
  },
  linhaDetalhe: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    background: "#fff",
    padding: "12px 14px",
    marginTop: 10,
  },
  linhaDetalheDark: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    borderRadius: 16,
    background: "#0f172a",
    color: "#fff",
    padding: "12px 14px",
    marginTop: 10,
  },
  memoriaItem: {
    borderRadius: 16,
    background: "#f8fafc",
    padding: "12px 14px",
    marginTop: 10,
  },
  textoBox: {
    borderRadius: 24,
    border: "1px dashed #cbd5e1",
    background: "#f8fafc",
    padding: 16,
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    borderRadius: 16,
    background: "#fff",
    padding: 14,
    marginTop: 12,
    fontSize: 14,
    color: "#475569",
    outline: "none",
  },
  feedbackOk: {
    border: "1px solid #a7f3d0",
    background: "#ecfdf5",
    color: "#047857",
    borderRadius: 16,
    padding: "12px 14px",
    fontSize: 14,
  },
  feedbackErro: {
    border: "1px solid #fde68a",
    background: "#fffbeb",
    color: "#b45309",
    borderRadius: 16,
    padding: "12px 14px",
    fontSize: 14,
  },
  rodape: {
    borderRadius: 28,
    border: "1px solid #e2e8f0",
    background: "#fff",
    padding: 16,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.04)",
  },
};

function CampoMonetario({ id, label, value, onChange, placeholder = "R$ 0,00", ajuda }) {
  return (
    <div style={estilos.campoWrap}>
      <div style={estilos.labelRow}>
        <label htmlFor={id} style={estilos.label}>{label}</label>
        {ajuda ? <span style={estilos.ajuda}>{ajuda}</span> : null}
      </div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(formatarMoedaInput(e.target.value))}
        style={estilos.input}
      />
    </div>
  );
}

function CampoNumero({ id, label, value, onChange, placeholder = "0", formatter = normalizarPercentualInteiro, sufixo = "%", ajuda }) {
  return (
    <div style={estilos.campoWrap}>
      <div style={estilos.labelRow}>
        <label htmlFor={id} style={estilos.label}>{label}</label>
        {ajuda ? <span style={estilos.ajuda}>{ajuda}</span> : null}
      </div>
      <div style={estilos.inputWrap}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(formatter(e.target.value))}
          style={{ ...estilos.input, paddingRight: sufixo ? 34 : 14 }}
        />
        {sufixo ? <span style={estilos.sufixo}>{sufixo}</span> : null}
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor, destaque = false, subtitulo }) {
  return (
    <div style={destaque ? estilos.resumoCardDark : estilos.resumoCard}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: destaque ? "#cbd5e1" : "#64748b" }}>{titulo}</div>
      <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700, color: destaque ? "#fff" : "#0f172a" }}>{moeda(valor)}</div>
      {subtitulo ? <div style={{ marginTop: 8, fontSize: 12, color: destaque ? "#cbd5e1" : "#64748b" }}>{subtitulo}</div> : null}
    </div>
  );
}

function LinhaDetalhe({ label, valor, destaque = false }) {
  return (
    <div style={destaque ? estilos.linhaDetalheDark : estilos.linhaDetalhe}>
      <span style={{ fontSize: 14, color: destaque ? "#e2e8f0" : "#475569" }}>{label}</span>
      <strong style={{ fontSize: 14 }}>{moeda(valor)}</strong>
    </div>
  );
}

function SecaoFormulario({ titulo, descricao, children }) {
  return (
    <div style={estilos.card}>
      <div style={estilos.cardHeader}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{titulo}</div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#64748b" }}>{descricao}</div>
      </div>
      <div style={estilos.cardContent}>
        <div style={estilos.formGrid}>{children}</div>
      </div>
    </div>
  );
}

function AvisoClipboard({ feedback }) {
  if (!feedback) return null;
  return <div style={feedback.tipo === "sucesso" ? estilos.feedbackOk : estilos.feedbackErro}>{feedback.mensagem}</div>;
}

function PainelApuracao({ titulo, subtitulo, cards, detalhes, memoria, textoCopia, onCopiar, feedback, textoRef }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={estilos.card}>
        <div style={estilos.cardHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{titulo}</div>
              <div style={{ marginTop: 6, fontSize: 14, color: "#64748b" }}>{subtitulo}</div>
            </div>
            <button onClick={onCopiar} style={{ ...estilos.botaoBase, ...estilos.botaoEscuro }}>Copiar resumo</button>
          </div>
        </div>
        <div style={estilos.cardContent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AvisoClipboard feedback={feedback} />

            <div style={estilos.resumoGrid}>
              {cards.map((card) => (
                <ResumoCard key={card.titulo} {...card} />
              ))}
            </div>

            <div style={estilos.detalheGrid}>
              <div style={estilos.detalheBox}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Detalhamento financeiro</div>
                {detalhes.map((item) => (
                  <LinhaDetalhe key={item.label} {...item} />
                ))}
              </div>

              <div style={estilos.memoriaBox}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Memória de cálculo</div>
                {memoria.map((item) => (
                  <div key={item.label} style={estilos.memoriaItem}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{item.label}</div>
                    <div style={{ marginTop: 4, fontSize: 14, color: "#64748b" }}>{item.texto}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={estilos.textoBox}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Texto operacional pronto</div>
              <pre ref={textoRef} tabIndex={0} style={estilos.pre}>{textoCopia}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tabs({ active, onChange }) {
  const tabs = [
    { id: "previdenciario", label: "Simulação de Honorários" },
    { id: "consulta", label: "Honorários de Consulta" },
    { id: "percentual", label: "Honorários Percentuais" },
  ];

  return (
    <div style={estilos.abasWrap}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={active === tab.id ? { ...estilos.aba, ...estilos.abaAtiva } : estilos.aba}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState("previdenciario");

  const [entrada, setEntrada] = useState("");
  const [atrasados, setAtrasados] = useState("");
  const [percentualAtrasados, setPercentualAtrasados] = useState("30");
  const [valorBeneficio, setValorBeneficio] = useState("");
  const [quantidadeBeneficios, setQuantidadeBeneficios] = useState("4");
  const [custas, setCustas] = useState("");
  const [despesas, setDespesas] = useState("");
  const [percentualImpostosPrev, setPercentualImpostosPrev] = useState("4,50");
  const [percentualParceiroPrev, setPercentualParceiroPrev] = useState("0");
  const [percentualAdvogadoPrev, setPercentualAdvogadoPrev] = useState("0");

  const [consultaValor, setConsultaValor] = useState("");
  const [consultaQuantidade, setConsultaQuantidade] = useState("1");
  const [percentualImpostosConsulta, setPercentualImpostosConsulta] = useState("4,50");
  const [percentualParceiroConsulta, setPercentualParceiroConsulta] = useState("0");
  const [percentualAdvogadoConsulta, setPercentualAdvogadoConsulta] = useState("0");

  const [contratoFixo, setContratoFixo] = useState("");
  const [contratoPercentualBase, setContratoPercentualBase] = useState("");
  const [contratoPercentual, setContratoPercentual] = useState("30");
  const [percentualImpostosContrato, setPercentualImpostosContrato] = useState("4,50");
  const [percentualParceiroContrato, setPercentualParceiroContrato] = useState("0");
  const [percentualAdvogadoContrato, setPercentualAdvogadoContrato] = useState("0");

  const [feedbackCopia, setFeedbackCopia] = useState({
    previdenciario: null,
    consulta: null,
    percentual: null,
  });

  const textoPrevidenciarioRef = useRef(null);
  const textoConsultaRef = useRef(null);
  const textoPercentualRef = useRef(null);

  const testesInternosOk = executarTestesInternos();

  const previdenciario = useMemo(() => {
    const vEntrada = numero(entrada);
    const vAtrasados = numero(atrasados);
    const pAtrasados = numero(percentualAtrasados) / 100;
    const vBeneficio = numero(valorBeneficio);
    const qBeneficios = numero(quantidadeBeneficios);
    const vCustas = numero(custas);
    const vDespesas = numero(despesas);
    const pImpostos = numero(percentualImpostosPrev) / 100;
    const pParceiro = numero(percentualParceiroPrev) / 100;
    const pAdvogado = numero(percentualAdvogadoPrev) / 100;

    const honorariosAtrasados = vAtrasados * pAtrasados;
    const honorariosBeneficio = vBeneficio * qBeneficios;
    const subtotalHonorarios = vEntrada + honorariosAtrasados + honorariosBeneficio;
    const totalCliente = subtotalHonorarios + vCustas + vDespesas;

    const valorImpostos = subtotalHonorarios * pImpostos;
    const baseRepasses = subtotalHonorarios - valorImpostos;
    const valorParceiro = baseRepasses * pParceiro;
    const baseAdvogado = baseRepasses - valorParceiro;
    const valorAdvogado = baseAdvogado * pAdvogado;
    const liquidoEscritorio = subtotalHonorarios - valorImpostos - valorParceiro - valorAdvogado;

    return {
      honorariosAtrasados,
      honorariosBeneficio,
      subtotalHonorarios,
      totalCliente,
      valorImpostos,
      valorParceiro,
      valorAdvogado,
      liquidoEscritorio,
      baseRepasses,
      baseAdvogado,
    };
  }, [entrada, atrasados, percentualAtrasados, valorBeneficio, quantidadeBeneficios, custas, despesas, percentualImpostosPrev, percentualParceiroPrev, percentualAdvogadoPrev]);

  const consulta = useMemo(() => {
    const bruto = numero(consultaValor) * numero(consultaQuantidade);
    const pImpostos = numero(percentualImpostosConsulta) / 100;
    const pParceiro = numero(percentualParceiroConsulta) / 100;
    const pAdvogado = numero(percentualAdvogadoConsulta) / 100;

    const valorImpostos = bruto * pImpostos;
    const baseRepasses = bruto - valorImpostos;
    const valorParceiro = baseRepasses * pParceiro;
    const baseAdvogado = baseRepasses - valorParceiro;
    const valorAdvogado = baseAdvogado * pAdvogado;
    const liquidoEscritorio = bruto - valorImpostos - valorParceiro - valorAdvogado;

    return {
      bruto,
      valorImpostos,
      valorParceiro,
      valorAdvogado,
      liquidoEscritorio,
      baseRepasses,
      baseAdvogado,
    };
  }, [consultaValor, consultaQuantidade, percentualImpostosConsulta, percentualParceiroConsulta, percentualAdvogadoConsulta]);

  const percentual = useMemo(() => {
    const fixo = numero(contratoFixo);
    const base = numero(contratoPercentualBase);
    const perc = numero(contratoPercentual) / 100;
    const pImpostos = numero(percentualImpostosContrato) / 100;
    const pParceiro = numero(percentualParceiroContrato) / 100;
    const pAdvogado = numero(percentualAdvogadoContrato) / 100;

    const variavel = base * perc;
    const total = fixo + variavel;

    const valorImpostos = total * pImpostos;
    const baseRepasses = total - valorImpostos;
    const valorParceiro = baseRepasses * pParceiro;
    const baseAdvogado = baseRepasses - valorParceiro;
    const valorAdvogado = baseAdvogado * pAdvogado;
    const liquidoEscritorio = total - valorImpostos - valorParceiro - valorAdvogado;

    return {
      variavel,
      total,
      valorImpostos,
      valorParceiro,
      valorAdvogado,
      liquidoEscritorio,
      baseRepasses,
      baseAdvogado,
    };
  }, [contratoFixo, contratoPercentualBase, contratoPercentual, percentualImpostosContrato, percentualParceiroContrato, percentualAdvogadoContrato]);

  const resumoPrevidenciario = `Resumo da simulação — Honorários Previdenciários\n\nEntrada: ${moeda(numero(entrada))}\nHonorários sobre atrasados: ${moeda(previdenciario.honorariosAtrasados)}\nHonorários sobre benefício: ${moeda(previdenciario.honorariosBeneficio)}\nSubtotal de honorários: ${moeda(previdenciario.subtotalHonorarios)}\nImpostos: ${moeda(previdenciario.valorImpostos)}\nRepasse parceiro: ${moeda(previdenciario.valorParceiro)}\nRepasse advogado: ${moeda(previdenciario.valorAdvogado)}\nTotal que o cliente paga: ${moeda(previdenciario.totalCliente)}\nLíquido do escritório: ${moeda(previdenciario.liquidoEscritorio)}`;

  const resumoConsulta = `Resumo da simulação — Honorários de Consulta\n\nBruto: ${moeda(consulta.bruto)}\nImpostos: ${moeda(consulta.valorImpostos)}\nRepasse parceiro: ${moeda(consulta.valorParceiro)}\nRepasse advogado: ${moeda(consulta.valorAdvogado)}\nLíquido do escritório: ${moeda(consulta.liquidoEscritorio)}`;

  const resumoPercentual = `Resumo da simulação — Honorários Percentuais\n\nParte fixa: ${moeda(numero(contratoFixo))}\nHonorários variáveis: ${moeda(percentual.variavel)}\nTotal do contrato: ${moeda(percentual.total)}\nImpostos: ${moeda(percentual.valorImpostos)}\nRepasse parceiro: ${moeda(percentual.valorParceiro)}\nRepasse advogado: ${moeda(percentual.valorAdvogado)}\nLíquido do escritório: ${moeda(percentual.liquidoEscritorio)}`;

  function limparFeedbackDepois(chave) {
    if (typeof window === "undefined") return;
    window.setTimeout(() => {
      setFeedbackCopia((atual) => ({ ...atual, [chave]: null }));
    }, 2500);
  }

  async function lidarComCopia(chave, texto, elementoRef) {
    const resultado = await copiarTextoSeguro(texto, elementoRef?.current || null);
    setFeedbackCopia((atual) => ({
      ...atual,
      [chave]: {
        tipo: resultado.ok ? "sucesso" : "erro",
        mensagem: resultado.message || (resultado.ok ? "Resumo copiado com sucesso." : "Não foi possível copiar automaticamente."),
      },
    }));
    limparFeedbackDepois(chave);
  }

  function limparTudo() {
    setEntrada("");
    setAtrasados("");
    setPercentualAtrasados("30");
    setValorBeneficio("");
    setQuantidadeBeneficios("4");
    setCustas("");
    setDespesas("");
    setPercentualImpostosPrev("4,50");
    setPercentualParceiroPrev("0");
    setPercentualAdvogadoPrev("0");

    setConsultaValor("");
    setConsultaQuantidade("1");
    setPercentualImpostosConsulta("4,50");
    setPercentualParceiroConsulta("0");
    setPercentualAdvogadoConsulta("0");

    setContratoFixo("");
    setContratoPercentualBase("");
    setContratoPercentual("30");
    setPercentualImpostosContrato("4,50");
    setPercentualParceiroContrato("0");
    setPercentualAdvogadoContrato("0");

    setFeedbackCopia({ previdenciario: null, consulta: null, percentual: null });
  }

  const conteudoPrevidenciario = (
    <div style={estilos.gridPrincipal}>
      <div style={estilos.coluna}>
        <SecaoFormulario titulo="Dados da simulação" descricao="Informe os valores principais do caso previdenciário para compor a base dos honorários.">
          <CampoMonetario id="entrada" label="Valor de entrada" value={entrada} onChange={setEntrada} />
          <CampoMonetario id="atrasados" label="Valor dos atrasados" value={atrasados} onChange={setAtrasados} />
          <CampoNumero id="percentualAtrasados" label="% sobre atrasados" value={percentualAtrasados} onChange={setPercentualAtrasados} formatter={normalizarPercentualInteiro} />
          <CampoMonetario id="beneficio" label="Valor mensal do benefício" value={valorBeneficio} onChange={setValorBeneficio} />
          <CampoNumero id="qBeneficios" label="Quantidade de benefícios" value={quantidadeBeneficios} onChange={setQuantidadeBeneficios} formatter={normalizarQuantidade} sufixo="" />
          <CampoMonetario id="custas" label="Custas" value={custas} onChange={setCustas} />
          <CampoMonetario id="despesas" label="Despesas / Adiantamentos" value={despesas} onChange={setDespesas} />
        </SecaoFormulario>

        <SecaoFormulario titulo="Parâmetros de repasse" descricao="Defina os percentuais internos para impostos e repasses da operação.">
          <CampoNumero id="impostosPrev" label="% impostos" value={percentualImpostosPrev} onChange={setPercentualImpostosPrev} placeholder="0,00" formatter={normalizarPercentualImposto} ajuda="Aceita decimal" />
          <CampoNumero id="parceiroPrev" label="% repasse parceiro indicador" value={percentualParceiroPrev} onChange={setPercentualParceiroPrev} formatter={normalizarPercentualInteiro} />
          <CampoNumero id="advogadoPrev" label="% repasse advogado do caso" value={percentualAdvogadoPrev} onChange={setPercentualAdvogadoPrev} formatter={normalizarPercentualInteiro} />
        </SecaoFormulario>
      </div>

      <PainelApuracao
        titulo="Resumo executivo"
        subtitulo="Visualização consolidada do resultado financeiro do caso previdenciário."
        onCopiar={() => lidarComCopia("previdenciario", resumoPrevidenciario, textoPrevidenciarioRef)}
        feedback={feedbackCopia.previdenciario}
        textoCopia={resumoPrevidenciario}
        textoRef={textoPrevidenciarioRef}
        cards={[
          { titulo: "Honorários totais", valor: previdenciario.subtotalHonorarios, subtitulo: "Base principal da operação" },
          { titulo: "Impostos e repasses", valor: previdenciario.valorImpostos + previdenciario.valorParceiro + previdenciario.valorAdvogado, subtitulo: "Saídas internas da operação" },
          { titulo: "Líquido do escritório", valor: previdenciario.liquidoEscritorio, subtitulo: "Resultado final líquido", destaque: true },
        ]}
        detalhes={[
          { label: "Entrada", valor: numero(entrada) },
          { label: `Honorários sobre atrasados (${percentualAtrasados || 0}%)`, valor: previdenciario.honorariosAtrasados },
          { label: "Honorários sobre benefício", valor: previdenciario.honorariosBeneficio },
          { label: "Subtotal de honorários", valor: previdenciario.subtotalHonorarios },
          { label: "Impostos", valor: previdenciario.valorImpostos },
          { label: "Repasse parceiro", valor: previdenciario.valorParceiro },
          { label: "Repasse advogado", valor: previdenciario.valorAdvogado },
          { label: "Total que o cliente paga", valor: previdenciario.totalCliente },
          { label: "Líquido do escritório", valor: previdenciario.liquidoEscritorio, destaque: true },
        ]}
        memoria={[
          { label: "Honorários sobre atrasados", texto: `${moeda(numero(atrasados))} × ${percentualAtrasados || 0}% = ${moeda(previdenciario.honorariosAtrasados)}` },
          { label: "Honorários sobre benefício", texto: `${moeda(numero(valorBeneficio))} × ${numero(quantidadeBeneficios)} = ${moeda(previdenciario.honorariosBeneficio)}` },
          { label: "Base para impostos", texto: `${percentualImpostosPrev || 0}% sobre ${moeda(previdenciario.subtotalHonorarios)} = ${moeda(previdenciario.valorImpostos)}` },
          { label: "Repasse parceiro", texto: `${percentualParceiroPrev || 0}% sobre ${moeda(previdenciario.baseRepasses)} = ${moeda(previdenciario.valorParceiro)}` },
          { label: "Repasse advogado", texto: `${percentualAdvogadoPrev || 0}% sobre ${moeda(previdenciario.baseAdvogado)} = ${moeda(previdenciario.valorAdvogado)}` },
        ]}
      />
    </div>
  );

  const conteudoConsulta = (
    <div style={estilos.gridPrincipal}>
      <div style={estilos.coluna}>
        <SecaoFormulario titulo="Dados da consulta" descricao="Informe o valor unitário da consulta ou análise e a quantidade realizada.">
          <CampoMonetario id="consultaValor" label="Valor por consulta / análise" value={consultaValor} onChange={setConsultaValor} />
          <CampoNumero id="consultaQtd" label="Quantidade" value={consultaQuantidade} onChange={setConsultaQuantidade} formatter={normalizarQuantidade} sufixo="" />
        </SecaoFormulario>

        <SecaoFormulario titulo="Parâmetros de repasse" descricao="Defina impostos e percentuais internos aplicáveis ao atendimento.">
          <CampoNumero id="impostosConsulta" label="% impostos" value={percentualImpostosConsulta} onChange={setPercentualImpostosConsulta} placeholder="0,00" formatter={normalizarPercentualImposto} ajuda="Aceita decimal" />
          <CampoNumero id="parceiroConsulta" label="% repasse parceiro indicador" value={percentualParceiroConsulta} onChange={setPercentualParceiroConsulta} formatter={normalizarPercentualInteiro} />
          <CampoNumero id="advogadoConsulta" label="% repasse advogado do caso" value={percentualAdvogadoConsulta} onChange={setPercentualAdvogadoConsulta} formatter={normalizarPercentualInteiro} />
        </SecaoFormulario>
      </div>

      <PainelApuracao
        titulo="Resultado financeiro"
        subtitulo="Apuração consolidada dos honorários de consulta ou análise previdenciária."
        onCopiar={() => lidarComCopia("consulta", resumoConsulta, textoConsultaRef)}
        feedback={feedbackCopia.consulta}
        textoCopia={resumoConsulta}
        textoRef={textoConsultaRef}
        cards={[
          { titulo: "Valor bruto", valor: consulta.bruto, subtitulo: "Receita inicial da consulta" },
          { titulo: "Impostos e repasses", valor: consulta.valorImpostos + consulta.valorParceiro + consulta.valorAdvogado, subtitulo: "Saídas internas da operação" },
          { titulo: "Líquido do escritório", valor: consulta.liquidoEscritorio, subtitulo: "Resultado final líquido", destaque: true },
        ]}
        detalhes={[
          { label: "Valor bruto", valor: consulta.bruto },
          { label: "Impostos", valor: consulta.valorImpostos },
          { label: "Repasse parceiro", valor: consulta.valorParceiro },
          { label: "Repasse advogado", valor: consulta.valorAdvogado },
          { label: "Líquido do escritório", valor: consulta.liquidoEscritorio, destaque: true },
        ]}
        memoria={[
          { label: "Composição do bruto", texto: `${moeda(numero(consultaValor))} × ${numero(consultaQuantidade)} = ${moeda(consulta.bruto)}` },
          { label: "Base para impostos", texto: `${percentualImpostosConsulta || 0}% sobre ${moeda(consulta.bruto)} = ${moeda(consulta.valorImpostos)}` },
          { label: "Repasse parceiro", texto: `${percentualParceiroConsulta || 0}% sobre ${moeda(consulta.baseRepasses)} = ${moeda(consulta.valorParceiro)}` },
          { label: "Repasse advogado", texto: `${percentualAdvogadoConsulta || 0}% sobre ${moeda(consulta.baseAdvogado)} = ${moeda(consulta.valorAdvogado)}` },
        ]}
      />
    </div>
  );

  const conteudoPercentual = (
    <div style={estilos.gridPrincipal}>
      <div style={estilos.coluna}>
        <SecaoFormulario titulo="Dados do contrato" descricao="Preencha a parte fixa, a base do êxito e o percentual contratado.">
          <CampoMonetario id="contratoFixo" label="Parte fixa" value={contratoFixo} onChange={setContratoFixo} />
          <CampoMonetario id="contratoBase" label="Valor base do êxito" value={contratoPercentualBase} onChange={setContratoPercentualBase} />
          <CampoNumero id="contratoPerc" label="Percentual (%)" value={contratoPercentual} onChange={setContratoPercentual} formatter={normalizarPercentualInteiro} />
        </SecaoFormulario>

        <SecaoFormulario titulo="Parâmetros de repasse" descricao="Defina impostos e percentuais de distribuição interna sobre o contrato.">
          <CampoNumero id="impostosContrato" label="% impostos" value={percentualImpostosContrato} onChange={setPercentualImpostosContrato} placeholder="0,00" formatter={normalizarPercentualImposto} ajuda="Aceita decimal" />
          <CampoNumero id="parceiroContrato" label="% repasse parceiro indicador" value={percentualParceiroContrato} onChange={setPercentualParceiroContrato} formatter={normalizarPercentualInteiro} />
          <CampoNumero id="advogadoContrato" label="% repasse advogado do caso" value={percentualAdvogadoContrato} onChange={setPercentualAdvogadoContrato} formatter={normalizarPercentualInteiro} />
        </SecaoFormulario>
      </div>

      <PainelApuracao
        titulo="Apuração do contrato"
        subtitulo="Resultado consolidado da composição fixa e variável dos honorários percentuais."
        onCopiar={() => lidarComCopia("percentual", resumoPercentual, textoPercentualRef)}
        feedback={feedbackCopia.percentual}
        textoCopia={resumoPercentual}
        textoRef={textoPercentualRef}
        cards={[
          { titulo: "Total do contrato", valor: percentual.total, subtitulo: "Base principal da operação" },
          { titulo: "Impostos e repasses", valor: percentual.valorImpostos + percentual.valorParceiro + percentual.valorAdvogado, subtitulo: "Saídas internas da operação" },
          { titulo: "Líquido do escritório", valor: percentual.liquidoEscritorio, subtitulo: "Resultado final líquido", destaque: true },
        ]}
        detalhes={[
          { label: "Parte fixa", valor: numero(contratoFixo) },
          { label: "Honorários variáveis", valor: percentual.variavel },
          { label: "Total do contrato", valor: percentual.total },
          { label: "Impostos", valor: percentual.valorImpostos },
          { label: "Repasse parceiro", valor: percentual.valorParceiro },
          { label: "Repasse advogado", valor: percentual.valorAdvogado },
          { label: "Líquido do escritório", valor: percentual.liquidoEscritorio, destaque: true },
        ]}
        memoria={[
          { label: "Honorários variáveis", texto: `${moeda(numero(contratoPercentualBase))} × ${contratoPercentual || 0}% = ${moeda(percentual.variavel)}` },
          { label: "Composição do total", texto: `${moeda(numero(contratoFixo))} + ${moeda(percentual.variavel)} = ${moeda(percentual.total)}` },
          { label: "Base para impostos", texto: `${percentualImpostosContrato || 0}% sobre ${moeda(percentual.total)} = ${moeda(percentual.valorImpostos)}` },
          { label: "Repasse parceiro", texto: `${percentualParceiroContrato || 0}% sobre ${moeda(percentual.baseRepasses)} = ${moeda(percentual.valorParceiro)}` },
          { label: "Repasse advogado", texto: `${percentualAdvogadoContrato || 0}% sobre ${moeda(percentual.baseAdvogado)} = ${moeda(percentual.valorAdvogado)}` },
        ]}
      />
    </div>
  );

  return (
    <div style={estilos.pagina}>
      <div style={estilos.container}>
        <div style={estilos.hero}>
          <div style={estilos.heroTopo}>
            <div style={estilos.marcaBox}>
              <div style={estilos.iconeMarca}>⚖️</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#cbd5e1" }}>Adonis Lima Advocacia</div>
                <div style={{ marginTop: 8, fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>Calculadora de Honorários</div>
                <div style={{ marginTop: 10, maxWidth: 780, fontSize: 15, color: "#cbd5e1" }}>
                  Simulação financeira para honorários advocatícios, repasses internos e apuração líquida do escritório.
                </div>
              </div>
            </div>

            <div style={estilos.botoesTopo}>
              <button onClick={limparTudo} style={{ ...estilos.botaoBase, background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                Nova simulação
              </button>
              <button style={{ ...estilos.botaoBase, ...estilos.botaoClaro }}>Ferramenta interna</button>
            </div>
          </div>
        </div>

        {!testesInternosOk ? (
          <div style={estilos.feedbackErro}>Falha nos testes internos de formatação. Revise as funções auxiliares antes de usar a calculadora.</div>
        ) : null}

        <Tabs active={abaAtiva} onChange={setAbaAtiva} />

        {abaAtiva === "previdenciario" ? conteudoPrevidenciario : null}
        {abaAtiva === "consulta" ? conteudoConsulta : null}
        {abaAtiva === "percentual" ? conteudoPercentual : null}

        <div style={estilos.rodape}>Ferramenta interna de simulação financeira — Adonis Lima Advocacia</div>
      </div>
    </div>
  );
}
