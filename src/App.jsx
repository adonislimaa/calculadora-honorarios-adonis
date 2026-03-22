import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Receipt,
  Percent,
  Landmark,
  RotateCcw,
  Copy,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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

  const valorNumerico = Math.min(Number(apenasDigitos), 100);
  return String(valorNumerico);
}

function normalizarQuantidade(valor) {
  const apenasDigitos = String(valor || "").replace(/\D/g, "");
  if (!apenasDigitos) return "";
  return String(Number(apenasDigitos));
}

function normalizarPercentualImposto(valor) {
  let limpo = String(valor || "")
    .replace(/[^\d,]/g, "")
    .replace(/(,.*),/g, "$$1");

  if (!limpo) return "";

  const numeroConvertido = parseFloat(limpo.replace(",", "."));

  if (!Number.isNaN(numeroConvertido) && numeroConvertido > 100) {
    return "100";
  }

  return limpo;
}

function selecionarTextoElemento(elemento) {
  if (!elemento || typeof window === "undefined") return;

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
      // segue para o método alternativo sem lançar erro no console
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
    // fallback final abaixo
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

function CampoMonetario({ id, label, value, onChange, placeholder = "R$ 0,00", ajuda }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
          {label}
        </Label>
        {ajuda ? <span className="text-[11px] text-slate-400">{ajuda}</span> : null}
      </div>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(formatarMoedaInput(e.target.value))}
        className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm transition focus:border-slate-400 focus:ring-0"
      />
    </div>
  );
}

function CampoNumero({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  formatter = normalizarPercentualInteiro,
  sufixo = "%",
  ajuda,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
          {label}
        </Label>
        {ajuda ? <span className="text-[11px] text-slate-400">{ajuda}</span> : null}
      </div>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(formatter(e.target.value))}
          className="h-11 rounded-2xl border-slate-200 bg-white pr-10 shadow-sm transition focus:border-slate-400 focus:ring-0"
        />
        {sufixo ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
            {sufixo}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor, destaque = false, subtitulo, icone: Icone }) {
  return (
    <div
      className={
        destaque
          ? "rounded-3xl border border-slate-900 bg-slate-900 p-5 text-white shadow-lg"
          : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={
              destaque
                ? "text-xs uppercase tracking-[0.08em] text-slate-300"
                : "text-xs uppercase tracking-[0.08em] text-slate-500"
            }
          >
            {titulo}
          </div>
          <div
            className={
              destaque
                ? "mt-2 text-3xl font-semibold tracking-tight"
                : "mt-2 text-3xl font-semibold tracking-tight text-slate-900"
            }
          >
            {moeda(valor)}
          </div>
          {subtitulo ? (
            <div className={destaque ? "mt-2 text-xs text-slate-300" : "mt-2 text-xs text-slate-500"}>{subtitulo}</div>
          ) : null}
        </div>
        {Icone ? (
          <div className={destaque ? "rounded-2xl bg-white/10 p-3" : "rounded-2xl bg-slate-100 p-3"}>
            <Icone className={destaque ? "h-5 w-5 text-white" : "h-5 w-5 text-slate-600"} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LinhaDetalhe({ label, valor, destaque = false }) {
  return (
    <div
      className={
        destaque
          ? "flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white"
          : "flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
      }
    >
      <span className={destaque ? "text-sm text-slate-200" : "text-sm text-slate-600"}>{label}</span>
      <span className="text-sm font-semibold">{moeda(valor)}</span>
    </div>
  );
}

function SecaoFormulario({ titulo, descricao, children, icone: Icone }) {
  return (
    <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-start gap-3 text-lg text-slate-900">
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icone className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <div className="text-lg font-semibold">{titulo}</div>
            <div className="mt-1 text-sm font-normal text-slate-500">{descricao}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function AvisoClipboard({ feedback }) {
  if (!feedback) return null;

  const sucesso = feedback.tipo === "sucesso";

  return (
    <div
      className={
        sucesso
          ? "flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          : "flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
      }
    >
      {sucesso ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <span>{feedback.mensagem}</span>
    </div>
  );
}

function PainelApuracao({
  titulo,
  subtitulo,
  cards,
  detalhes,
  memoria,
  textoCopia,
  onCopiar,
  feedback,
  textoRef,
}) {
  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-900">{titulo}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>
            </div>
            <Button onClick={onCopiar} className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
              <Copy className="mr-2 h-4 w-4" /> Copiar resumo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AvisoClipboard feedback={feedback} />

          <div className="grid gap-4 xl:grid-cols-3">
            {cards.map((card) => (
              <ResumoCard key={card.titulo} {...card} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Detalhamento financeiro</div>
              <div className="space-y-3">
                {detalhes.map((item) => (
                  <LinhaDetalhe key={item.label} {...item} />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-900">Memória de cálculo</div>
              <div className="space-y-3 text-sm text-slate-600">
                {memoria.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="font-medium text-slate-800">{item.label}</div>
                    <div className="mt-1 text-slate-500">{item.texto}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Texto operacional pronto</div>
            <pre
              ref={textoRef}
              tabIndex={0}
              className="mt-2 whitespace-pre-wrap break-words rounded-2xl bg-white p-3 font-sans text-sm text-slate-600 outline-none"
            >
              {textoCopia}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function executarTestesInternos() {
  const testes = [
    {
      nome: "numero converte moeda brasileira",
      passou: numero("R$ 1.234,56") === 1234.56,
    },
    {
      nome: "percentual inteiro limita em 100",
      passou: normalizarPercentualInteiro("150") === "100",
    },
    {
      nome: "quantidade remove caracteres não numéricos",
      passou: normalizarQuantidade("03abc") === "3",
    },
    {
      nome: "percentual imposto aceita decimal com vírgula",
      passou: normalizarPercentualImposto("4,5") === "4,5",
    },
  ];

  return testes.every((teste) => teste.passou);
}

const testesInternosOk = executarTestesInternos();

export default function App() {
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

  const textoPrevidenciarioRef = React.useRef(null);
  const textoConsultaRef = React.useRef(null);
  const textoPercentualRef = React.useRef(null);

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
      baseRepasses,
      baseAdvogado,
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
      baseRepasses,
      baseAdvogado,
    };
  }, [
    contratoFixo,
    contratoPercentualBase,
    contratoPercentual,
    percentualImpostosContrato,
    percentualParceiroContrato,
    percentualAdvogadoContrato,
  ]);

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

    setFeedbackCopia({
      previdenciario: null,
      consulta: null,
      percentual: null,
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2f7_45%,_#e2e8f0_100%)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_55%,_#334155_100%)] px-6 py-6 md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.16em] text-slate-300">Adonis Lima Advocacia</div>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Calculadora de Honorários</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                    Simulação financeira para honorários advocatícios, repasses internos e apuração líquida do escritório.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={limparTudo}
                  className="rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Nova simulação
                </Button>
                <Button className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Ferramenta interna
                </Button>
              </div>
            </div>
          </div>
        </div>

        {!testesInternosOk ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Falha nos testes internos de formatação. Revise as funções auxiliares antes de usar a calculadora.
          </div>
        ) : null}

        <Tabs defaultValue="previdenciario" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 gap-2 rounded-[28px] bg-transparent p-0 md:grid-cols-3">
            <TabsTrigger
              value="previdenciario"
              className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-700 shadow-sm data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
            >
              <Landmark className="mr-2 h-4 w-4" /> Simulação de Honorários
            </TabsTrigger>
            <TabsTrigger
              value="consulta"
              className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-700 shadow-sm data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
            >
              <Receipt className="mr-2 h-4 w-4" /> Honorários de Consulta
            </TabsTrigger>
            <TabsTrigger
              value="percentual"
              className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-700 shadow-sm data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
            >
              <Percent className="mr-2 h-4 w-4" /> Honorários Percentuais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="previdenciario" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <div className="space-y-6">
                <SecaoFormulario
                  titulo="Dados da simulação"
                  descricao="Informe os valores principais do caso previdenciário para compor a base dos honorários."
                  icone={Calculator}
                >
                  <CampoMonetario id="entrada" label="Valor de entrada" value={entrada} onChange={setEntrada} />
                  <CampoMonetario id="atrasados" label="Valor dos atrasados" value={atrasados} onChange={setAtrasados} />
                  <CampoNumero
                    id="percentualAtrasados"
                    label="% sobre atrasados"
                    value={percentualAtrasados}
                    onChange={setPercentualAtrasados}
                    formatter={normalizarPercentualInteiro}
                  />
                  <CampoMonetario id="beneficio" label="Valor mensal do benefício" value={valorBeneficio} onChange={setValorBeneficio} />
                  <CampoNumero
                    id="qBeneficios"
                    label="Quantidade de benefícios"
                    value={quantidadeBeneficios}
                    onChange={setQuantidadeBeneficios}
                    formatter={normalizarQuantidade}
                    sufixo=""
                  />
                  <CampoMonetario id="custas" label="Custas" value={custas} onChange={setCustas} />
                  <CampoMonetario id="despesas" label="Despesas / Adiantamentos" value={despesas} onChange={setDespesas} />
                </SecaoFormulario>

                <SecaoFormulario
                  titulo="Parâmetros de repasse"
                  descricao="Defina os percentuais internos para impostos e repasses da operação."
                  icone={Wallet}
                >
                  <CampoNumero
                    id="impostosPrev"
                    label="% impostos"
                    value={percentualImpostosPrev}
                    onChange={setPercentualImpostosPrev}
                    placeholder="0,00"
                    formatter={normalizarPercentualImposto}
                    ajuda="Aceita decimal"
                  />
                  <CampoNumero
                    id="parceiroPrev"
                    label="% repasse parceiro indicador"
                    value={percentualParceiroPrev}
                    onChange={setPercentualParceiroPrev}
                    formatter={normalizarPercentualInteiro}
                  />
                  <CampoNumero
                    id="advogadoPrev"
                    label="% repasse advogado do caso"
                    value={percentualAdvogadoPrev}
                    onChange={setPercentualAdvogadoPrev}
                    formatter={normalizarPercentualInteiro}
                  />
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
                  {
                    titulo: "Honorários totais",
                    valor: previdenciario.subtotalHonorarios,
                    subtitulo: "Base principal da operação",
                    icone: Landmark,
                  },
                  {
                    titulo: "Impostos e repasses",
                    valor: previdenciario.valorImpostos + previdenciario.valorParceiro + previdenciario.valorAdvogado,
                    subtitulo: "Saídas internas da operação",
                    icone: Receipt,
                  },
                  {
                    titulo: "Líquido do escritório",
                    valor: previdenciario.liquidoEscritorio,
                    subtitulo: "Resultado final líquido",
                    destaque: true,
                    icone: Wallet,
                  },
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
                  {
                    label: "Honorários sobre atrasados",
                    texto: `${moeda(numero(atrasados))} × ${percentualAtrasados || 0}% = ${moeda(previdenciario.honorariosAtrasados)}`,
                  },
                  {
                    label: "Honorários sobre benefício",
                    texto: `${moeda(numero(valorBeneficio))} × ${numero(quantidadeBeneficios)} = ${moeda(previdenciario.honorariosBeneficio)}`,
                  },
                  {
                    label: "Base para impostos",
                    texto: `${percentualImpostosPrev || 0}% sobre ${moeda(previdenciario.subtotalHonorarios)} = ${moeda(previdenciario.valorImpostos)}`,
                  },
                  {
                    label: "Repasse parceiro",
                    texto: `${percentualParceiroPrev || 0}% sobre ${moeda(previdenciario.baseRepasses)} = ${moeda(previdenciario.valorParceiro)}`,
                  },
                  {
                    label: "Repasse advogado",
                    texto: `${percentualAdvogadoPrev || 0}% sobre ${moeda(previdenciario.baseAdvogado)} = ${moeda(previdenciario.valorAdvogado)}`,
                  },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="consulta" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
              <div className="space-y-6">
                <SecaoFormulario
                  titulo="Dados da consulta"
                  descricao="Informe o valor unitário da consulta ou análise e a quantidade realizada."
                  icone={Receipt}
                >
                  <CampoMonetario id="consultaValor" label="Valor por consulta / análise" value={consultaValor} onChange={setConsultaValor} />
                  <CampoNumero
                    id="consultaQtd"
                    label="Quantidade"
                    value={consultaQuantidade}
                    onChange={setConsultaQuantidade}
                    formatter={normalizarQuantidade}
                    sufixo=""
                  />
                </SecaoFormulario>

                <SecaoFormulario
                  titulo="Parâmetros de repasse"
                  descricao="Defina impostos e percentuais internos aplicáveis ao atendimento."
                  icone={Wallet}
                >
                  <CampoNumero
                    id="impostosConsulta"
                    label="% impostos"
                    value={percentualImpostosConsulta}
                    onChange={setPercentualImpostosConsulta}
                    placeholder="0,00"
                    formatter={normalizarPercentualImposto}
                    ajuda="Aceita decimal"
                  />
                  <CampoNumero
                    id="parceiroConsulta"
                    label="% repasse parceiro indicador"
                    value={percentualParceiroConsulta}
                    onChange={setPercentualParceiroConsulta}
                    formatter={normalizarPercentualInteiro}
                  />
                  <CampoNumero
                    id="advogadoConsulta"
                    label="% repasse advogado do caso"
                    value={percentualAdvogadoConsulta}
                    onChange={setPercentualAdvogadoConsulta}
                    formatter={normalizarPercentualInteiro}
                  />
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
                  {
                    titulo: "Valor bruto",
                    valor: consulta.bruto,
                    subtitulo: "Receita inicial da consulta",
                    icone: Receipt,
                  },
                  {
                    titulo: "Impostos e repasses",
                    valor: consulta.valorImpostos + consulta.valorParceiro + consulta.valorAdvogado,
                    subtitulo: "Saídas internas da operação",
                    icone: Percent,
                  },
                  {
                    titulo: "Líquido do escritório",
                    valor: consulta.liquidoEscritorio,
                    subtitulo: "Resultado final líquido",
                    destaque: true,
                    icone: Wallet,
                  },
                ]}
                detalhes={[
                  { label: "Valor bruto", valor: consulta.bruto },
                  { label: "Impostos", valor: consulta.valorImpostos },
                  { label: "Repasse parceiro", valor: consulta.valorParceiro },
                  { label: "Repasse advogado", valor: consulta.valorAdvogado },
                  { label: "Líquido do escritório", valor: consulta.liquidoEscritorio, destaque: true },
                ]}
                memoria={[
                  {
                    label: "Composição do bruto",
                    texto: `${moeda(numero(consultaValor))} × ${numero(consultaQuantidade)} = ${moeda(consulta.bruto)}`,
                  },
                  {
                    label: "Base para impostos",
                    texto: `${percentualImpostosConsulta || 0}% sobre ${moeda(consulta.bruto)} = ${moeda(consulta.valorImpostos)}`,
                  },
                  {
                    label: "Repasse parceiro",
                    texto: `${percentualParceiroConsulta || 0}% sobre ${moeda(consulta.baseRepasses)} = ${moeda(consulta.valorParceiro)}`,
                  },
                  {
                    label: "Repasse advogado",
                    texto: `${percentualAdvogadoConsulta || 0}% sobre ${moeda(consulta.baseAdvogado)} = ${moeda(consulta.valorAdvogado)}`,
                  },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="percentual" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
              <div className="space-y-6">
                <SecaoFormulario
                  titulo="Dados do contrato"
                  descricao="Preencha a parte fixa, a base do êxito e o percentual contratado."
                  icone={Percent}
                >
                  <CampoMonetario id="contratoFixo" label="Parte fixa" value={contratoFixo} onChange={setContratoFixo} />
                  <CampoMonetario id="contratoBase" label="Valor base do êxito" value={contratoPercentualBase} onChange={setContratoPercentualBase} />
                  <CampoNumero
                    id="contratoPerc"
                    label="Percentual (%)"
                    value={contratoPercentual}
                    onChange={setContratoPercentual}
                    formatter={normalizarPercentualInteiro}
                  />
                </SecaoFormulario>

                <SecaoFormulario
                  titulo="Parâmetros de repasse"
                  descricao="Defina impostos e percentuais de distribuição interna sobre o contrato."
                  icone={Wallet}
                >
                  <CampoNumero
                    id="impostosContrato"
                    label="% impostos"
                    value={percentualImpostosContrato}
                    onChange={setPercentualImpostosContrato}
                    placeholder="0,00"
                    formatter={normalizarPercentualImposto}
                    ajuda="Aceita decimal"
                  />
                  <CampoNumero
                    id="parceiroContrato"
                    label="% repasse parceiro indicador"
                    value={percentualParceiroContrato}
                    onChange={setPercentualParceiroContrato}
                    formatter={normalizarPercentualInteiro}
                  />
                  <CampoNumero
                    id="advogadoContrato"
                    label="% repasse advogado do caso"
                    value={percentualAdvogadoContrato}
                    onChange={setPercentualAdvogadoContrato}
                    formatter={normalizarPercentualInteiro}
                  />
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
                  {
                    titulo: "Total do contrato",
                    valor: percentual.total,
                    subtitulo: "Base principal da operação",
                    icone: Percent,
                  },
                  {
                    titulo: "Impostos e repasses",
                    valor: percentual.valorImpostos + percentual.valorParceiro + percentual.valorAdvogado,
                    subtitulo: "Saídas internas da operação",
                    icone: Receipt,
                  },
                  {
                    titulo: "Líquido do escritório",
                    valor: percentual.liquidoEscritorio,
                    subtitulo: "Resultado final líquido",
                    destaque: true,
                    icone: Wallet,
                  },
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
                  {
                    label: "Honorários variáveis",
                    texto: `${moeda(numero(contratoPercentualBase))} × ${contratoPercentual || 0}% = ${moeda(percentual.variavel)}`,
                  },
                  {
                    label: "Composição do total",
                    texto: `${moeda(numero(contratoFixo))} + ${moeda(percentual.variavel)} = ${moeda(percentual.total)}`,
                  },
                  {
                    label: "Base para impostos",
                    texto: `${percentualImpostosContrato || 0}% sobre ${moeda(percentual.total)} = ${moeda(percentual.valorImpostos)}`,
                  },
                  {
                    label: "Repasse parceiro",
                    texto: `${percentualParceiroContrato || 0}% sobre ${moeda(percentual.baseRepasses)} = ${moeda(percentual.valorParceiro)}`,
                  },
                  {
                    label: "Repasse advogado",
                    texto: `${percentualAdvogadoContrato || 0}% sobre ${moeda(percentual.baseAdvogado)} = ${moeda(percentual.valorAdvogado)}`,
                  },
                ]}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400 shadow-sm">
          Ferramenta interna de simulação financeira — Adonis Lima Advocacia
        </div>
      </div>
    </div>
  );
}
