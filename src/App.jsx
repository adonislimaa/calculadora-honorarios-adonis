import React, { useMemo, useState } from "react";

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

function normalizarDecimalInput(valor) {
  const apenasDigitos = String(valor || "").replace(/\D/g, "");
  if (!apenasDigitos) return "";

  const valorNumerico = Math.min(Number(apenasDigitos) / 100, 100);

  return valorNumerico.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizarPercentualInteiro(valor) {
  const apenasDigitos = String(valor || "").replace(/\D/g, "");
  if (!apenasDigitos) return "";

  const valorNumerico = Math.min(Number(apenasDigitos), 100);
  return String(valorNumerico);
}

function cardStyle(extra = {}) {
  return {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    ...extra,
  };
}

function inputStyle() {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  };
}

function labelStyle() {
  return {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
  };
}

function CampoMonetario({ id, label, value, onChange, placeholder = "R$ 0,00" }) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle()}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(formatarMoedaInput(e.target.value))}
        style={inputStyle()}
      />
    </div>
  );
}

function CampoNumero({
  id,
  label,
  value,
  onChange,
  placeholder = "0,00",
  formatter = normalizarDecimalInput,
}) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle()}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(formatter(e.target.value))}
          style={{ ...inputStyle(), paddingRight: "36px" }}
        />
        <span
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "14px",
            color: "#64748b",
            pointerEvents: "none",
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}

function BlocoResumo({ titulo, valor, destaque = false, subtitulo }) {
  return (
    <div
      style={{
        borderRadius: "18px",
        padding: "16px",
        background: destaque ? "#0f172a" : "#f1f5f9",
        color: destaque ? "#ffffff" : "#0f172a",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: destaque ? "#cbd5e1" : "#64748b",
          marginBottom: "6px",
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          fontSize: destaque ? "30px" : "24px",
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {moeda(valor)}
      </div>
      {subtitulo ? (
        <div
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: destaque ? "#94a3b8" : "#64748b",
          }}
        >
          {subtitulo}
        </div>
      ) : null}
    </div>
  );
}

function AbaBotao({ ativa, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: "18px",
        border: "1px solid #d1d5db",
        background: ativa ? "#e2e8f0" : "#ffffff",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "14px",
      }}
    >
      {children}
    </button>
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

    const baseImpostos = vEntrada + honorariosAtrasados + honorariosBeneficio;
    const valorImpostos = baseImpostos * pImpostos;

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
    };
  }, [
    entrada,
    atrasados,
    percentualAtrasados,
    valorBeneficio,
    quantidadeBeneficios,
    custas,
    despesas,
    percentualImpostosPrev,
    percentualParceiroPrev,
    percentualAdvogadoPrev,
  ]);

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
    };
  }, [
    consultaValor,
    consultaQuantidade,
    percentualImpostosConsulta,
    percentualParceiroConsulta,
    percentualAdvogadoConsulta,
  ]);

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
    };
  }, [
    contratoFixo,
    contratoPercentualBase,
    contratoPercentual,
    percentualImpostosContrato,
    percentualParceiroContrato,
    percentualAdvogadoContrato,
  ]);

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
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#0f172a",
              }}
            >
              Calculadora de Honorários
            </h1>
            <p style={{ marginTop: "8px", color: "#475569", fontSize: "14px" }}>
              Simule honorários, descontos internos e o líquido do escritório por caso.
            </p>
          </div>

          <button
            onClick={limparTudo}
            type="button"
            style={{
              padding: "12px 16px",
              borderRadius: "16px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Limpar campos
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <AbaBotao ativa={abaAtiva === "previdenciario"} onClick={() => setAbaAtiva("previdenciario")}>
            Simulação de Honorários
          </AbaBotao>
          <AbaBotao ativa={abaAtiva === "consulta"} onClick={() => setAbaAtiva("consulta")}>
            Honorários de Consulta
          </AbaBotao>
          <AbaBotao ativa={abaAtiva === "percentual"} onClick={() => setAbaAtiva("percentual")}>
            Honorários Percentuais
          </AbaBotao>
        </div>

        {abaAtiva === "previdenciario" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "24px",
            }}
          >
            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>
                Calculadora de Honorários
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <CampoMonetario id="entrada" label="Valor de entrada" value={entrada} onChange={setEntrada} />
                <CampoMonetario id="atrasados" label="Valor dos atrasados" value={atrasados} onChange={setAtrasados} />
                <CampoNumero
                  id="percentualAtrasados"
                  label="% sobre atrasados"
                  value={percentualAtrasados}
                  onChange={setPercentualAtrasados}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
                <CampoMonetario id="beneficio" label="Valor mensal do benefício" value={valorBeneficio} onChange={setValorBeneficio} />
                <CampoNumero
                  id="qBeneficios"
                  label="Quantidade de benefícios"
                  value={quantidadeBeneficios}
                  onChange={setQuantidadeBeneficios}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
                <CampoMonetario id="custas" label="Custas" value={custas} onChange={setCustas} />
                <CampoMonetario id="despesas" label="Despesas/Adiantamentos" value={despesas} onChange={setDespesas} />
                <CampoNumero
                  id="impostosPrev"
                  label="% impostos"
                  value={percentualImpostosPrev}
                  onChange={setPercentualImpostosPrev}
                  placeholder="0,00"
                  formatter={normalizarDecimalInput}
                />
                <CampoNumero
                  id="parceiroPrev"
                  label="% repasse parceiro indicador"
                  value={percentualParceiroPrev}
                  onChange={setPercentualParceiroPrev}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
                <CampoNumero
                  id="advogadoPrev"
                  label="% repasse advogado do caso"
                  value={percentualAdvogadoPrev}
                  onChange={setPercentualAdvogadoPrev}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>Resumo financeiro</h2>
              <div style={{ display: "grid", gap: "14px" }}>
                <BlocoResumo titulo="Entrada" valor={numero(entrada)} />
                <BlocoResumo
                  titulo={`${percentualAtrasados}% dos atrasados`}
                  valor={previdenciario.honorariosAtrasados}
                  subtitulo={`Atrasados (${moeda(numero(atrasados))}) × ${percentualAtrasados}% = ${moeda(previdenciario.honorariosAtrasados)}`}
                />
                <BlocoResumo titulo="Honorários sobre benefício" valor={previdenciario.honorariosBeneficio} />
                <BlocoResumo
                  titulo="Subtotal de honorários"
                  valor={previdenciario.subtotalHonorarios}
                  subtitulo="Base usada para impostos e repasses"
                />
                <BlocoResumo
                  titulo="Impostos"
                  valor={previdenciario.valorImpostos}
                  subtitulo={`${percentualImpostosPrev}% sobre entrada + honorários dos atrasados + honorários sobre benefício: ${moeda(
                    numero(entrada) + (previdenciario?.honorariosAtrasados || 0) + (previdenciario?.honorariosBeneficio || 0)
                  )}`}
                />
                <BlocoResumo
                  titulo="Repasse do parceiro"
                  valor={previdenciario.valorParceiro}
                  subtitulo="Calculado antes do repasse do advogado"
                />
                <BlocoResumo
                  titulo="Repasse do advogado"
                  valor={previdenciario.valorAdvogado}
                  subtitulo="Calculado sobre o saldo após o repasse do parceiro"
                />
                <BlocoResumo
                  titulo="Total que o cliente paga"
                  valor={previdenciario.totalCliente}
                  subtitulo="Honorários + custas + despesas"
                />
                <BlocoResumo
                  titulo="Líquido do escritório"
                  valor={previdenciario.liquidoEscritorio}
                  destaque
                  subtitulo="Subtotal de honorários menos impostos e repasses"
                />
              </div>
            </div>
          </div>
        )}

        {abaAtiva === "consulta" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 0.8fr",
              gap: "24px",
            }}
          >
            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>Honorários de Consulta</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <CampoMonetario id="consultaValor" label="Valor por consulta/análise" value={consultaValor} onChange={setConsultaValor} />
                <CampoNumero
                  id="consultaQtd"
                  label="Quantidade"
                  value={consultaQuantidade}
                  onChange={setConsultaQuantidade}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
                <CampoNumero
                  id="impostosConsulta"
                  label="% impostos"
                  value={percentualImpostosConsulta}
                  onChange={setPercentualImpostosConsulta}
                  placeholder="0,00"
                  formatter={normalizarDecimalInput}
                />
                <CampoNumero
                  id="parceiroConsulta"
                  label="% repasse parceiro indicador"
                  value={percentualParceiroConsulta}
                  onChange={setPercentualParceiroConsulta}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
                <CampoNumero
                  id="advogadoConsulta"
                  label="% repasse advogado do caso"
                  value={percentualAdvogadoConsulta}
                  onChange={setPercentualAdvogadoConsulta}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>Resultado</h2>
              <div style={{ display: "grid", gap: "14px" }}>
                <BlocoResumo titulo="Valor bruto" valor={consulta.bruto} />
                <BlocoResumo titulo="Impostos" valor={consulta.valorImpostos} subtitulo={`${percentualImpostosConsulta}% sobre o valor bruto`} />
                <BlocoResumo titulo="Repasse do parceiro" valor={consulta.valorParceiro} subtitulo="Calculado antes do repasse do advogado" />
                <BlocoResumo titulo="Repasse do advogado" valor={consulta.valorAdvogado} subtitulo="Calculado sobre o saldo após o repasse do parceiro" />
                <BlocoResumo titulo="Líquido do escritório" valor={consulta.liquidoEscritorio} destaque />
              </div>
            </div>
          </div>
        )}

        {abaAtiva === "percentual" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 0.8fr",
              gap: "24px",
            }}
          >
            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>Honorários Percentuais</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <CampoMonetario id="contratoFixo" label="Parte fixa" value={contratoFixo} onChange={setContratoFixo} />
                <CampoMonetario id="contratoBase" label="Valor base do êxito" value={contratoPercentualBase} onChange={setContratoPercentualBase} />
                <CampoNumero
                  id="contratoPerc"
                  label="Percentual (%)"
                  value={contratoPercentual}
                  onChange={setContratoPercentual}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
                <CampoNumero
                  id="impostosContrato"
                  label="% impostos"
                  value={percentualImpostosContrato}
                  onChange={setPercentualImpostosContrato}
                  placeholder="0,00"
                  formatter={normalizarDecimalInput}
                />
                <CampoNumero
                  id="parceiroContrato"
                  label="% repasse parceiro indicador"
                  value={percentualParceiroContrato}
                  onChange={setPercentualParceiroContrato}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
                <CampoNumero
                  id="advogadoContrato"
                  label="% repasse advogado do caso"
                  value={percentualAdvogadoContrato}
                  onChange={setPercentualAdvogadoContrato}
                  placeholder="0"
                  formatter={normalizarPercentualInteiro}
                />
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>Apuração</h2>
              <div style={{ display: "grid", gap: "14px" }}>
                <BlocoResumo
                  titulo="Honorários variáveis (percentual)"
                  subtitulo={`Base (${moeda(numero(contratoPercentualBase))}) × ${contratoPercentual}% = ${moeda(percentual.variavel)}`}
                  valor={percentual.variavel}
                />
                <BlocoResumo titulo="Total do contrato" valor={percentual.total} subtitulo="Base usada para impostos e repasses" />
                <BlocoResumo titulo="Impostos" valor={percentual.valorImpostos} subtitulo={`${percentualImpostosContrato}% sobre o total do contrato`} />
                <BlocoResumo titulo="Repasse do parceiro" valor={percentual.valorParceiro} subtitulo="Calculado antes do repasse do advogado" />
                <BlocoResumo titulo="Repasse do advogado" valor={percentual.valorAdvogado} subtitulo="Calculado sobre o saldo após o repasse do parceiro" />
                <BlocoResumo titulo="Líquido do escritório" valor={percentual.liquidoEscritorio} destaque />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}