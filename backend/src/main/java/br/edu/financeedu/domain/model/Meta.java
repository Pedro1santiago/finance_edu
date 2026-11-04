package br.edu.financeedu.domain.model;

import br.edu.financeedu.domain.exception.RegraNegocioException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class Meta {

    public enum Status { ATIVA, CONCLUIDA }

    private static final BigDecimal MAX_VALOR = new BigDecimal("9999999999999.99");
    private static final int MAX_NOME = 120;
    private static final int MAX_ANO = 9999;

    private final Long id;
    private final Long usuarioId;
    private String nome;
    private BigDecimal valorAlvo;
    private LocalDate prazo;
    private final LocalDate criadaEm;
    private final List<Aporte> aportes;

    public Meta(Long id, Long usuarioId, String nome, BigDecimal valorAlvo, LocalDate prazo,
                LocalDate criadaEm, List<Aporte> aportes) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.valorAlvo = valorAlvo;
        this.prazo = prazo;
        this.criadaEm = criadaEm;
        this.aportes = new ArrayList<>(aportes);
    }

    public static Meta nova(Long usuarioId, String nome, BigDecimal valorAlvo, LocalDate prazo, LocalDate hoje) {
        Meta meta = new Meta(null, usuarioId, null, null, null, hoje, List.of());
        meta.alterar(nome, valorAlvo, prazo, hoje);
        return meta;
    }

    public void alterar(String nome, BigDecimal valorAlvo, LocalDate prazo, LocalDate hoje) {
        if (nome == null || nome.isBlank()) throw new RegraNegocioException("nome é obrigatório");
        if (nome.trim().length() > MAX_NOME) throw new RegraNegocioException("nome deve ter no máximo " + MAX_NOME + " caracteres");
        dinheiro(valorAlvo, "valorAlvo");
        if (prazo == null) throw new RegraNegocioException("prazo é obrigatório");
        if (prazo.getYear() > MAX_ANO) throw new RegraNegocioException("prazo deve ser até o ano " + MAX_ANO);
        if (!prazo.equals(this.prazo) && prazo.isBefore(hoje)) throw new RegraNegocioException("prazo não pode estar no passado");
        this.nome = nome.trim();
        this.valorAlvo = valorAlvo;
        this.prazo = prazo;
    }

    public Aporte registrarAporte(BigDecimal valor, LocalDate data, LocalDate hoje) {
        dinheiro(valor, "valor do aporte");
        if (data == null) throw new RegraNegocioException("data do aporte é obrigatória");
        if (data.isAfter(hoje)) throw new RegraNegocioException("data do aporte não pode estar no futuro");
        Aporte aporte = new Aporte(null, valor, data);
        aportes.add(aporte);
        return aporte;
    }

    public BigDecimal totalEconomizado() {
        return aportes.stream().map(Aporte::valor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal valorRestante() {
        return valorAlvo.subtract(totalEconomizado()).max(BigDecimal.ZERO);
    }

    public BigDecimal percentualAtingido() {
        BigDecimal pct = totalEconomizado().multiply(BigDecimal.valueOf(100)).divide(valorAlvo, 2, RoundingMode.HALF_EVEN);
        return pct.min(BigDecimal.valueOf(100).setScale(2));
    }

    public Status status() {
        return totalEconomizado().compareTo(valorAlvo) >= 0 ? Status.CONCLUIDA : Status.ATIVA;
    }

    /** Projeta pela média mensal de aportes desde a criação; null se concluída ou sem aportes. */
    public LocalDate estimativaConclusao(LocalDate hoje) {
        if (status() == Status.CONCLUIDA || aportes.isEmpty()) return null;
        long meses = Math.max(1, ChronoUnit.MONTHS.between(criadaEm, hoje) + 1);
        long mesesRestantes = valorRestante().multiply(BigDecimal.valueOf(meses))
                .divide(totalEconomizado(), 0, RoundingMode.CEILING).longValue();
        return hoje.plusMonths(mesesRestantes);
    }

    private static void dinheiro(BigDecimal v, String campo) {
        if (v == null || v.signum() <= 0) throw new RegraNegocioException(campo + " deve ser maior que zero");
        if (v.stripTrailingZeros().scale() > 2) throw new RegraNegocioException(campo + " deve ter no máximo 2 casas decimais");
        if (v.compareTo(MAX_VALOR) > 0) throw new RegraNegocioException(campo + " deve ser no máximo " + MAX_VALOR.toPlainString());
    }

    public Long id() { return id; }
    public Long usuarioId() { return usuarioId; }
    public String nome() { return nome; }
    public BigDecimal valorAlvo() { return valorAlvo; }
    public LocalDate prazo() { return prazo; }
    public LocalDate criadaEm() { return criadaEm; }
    public List<Aporte> aportes() { return List.copyOf(aportes); }
}
