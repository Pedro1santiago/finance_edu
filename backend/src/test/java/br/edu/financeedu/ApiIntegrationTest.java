package br.edu.financeedu;

import com.jayway.jsonpath.JsonPath;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("dev")
@AutoConfigureMockMvc
class ApiIntegrationTest {

    static EmbeddedPostgres postgres;

    @DynamicPropertySource
    static void banco(DynamicPropertyRegistry r) throws IOException {
        postgres = EmbeddedPostgres.start();
        r.add("spring.datasource.url", () -> postgres.getJdbcUrl("postgres", "postgres"));
        r.add("spring.datasource.username", () -> "postgres");
        r.add("spring.datasource.password", () -> "postgres");
    }

    @AfterAll
    static void parar() throws IOException {
        postgres.close();
    }

    @Autowired
    MockMvc mvc;

    private String registrar() throws Exception {
        String email = UUID.randomUUID() + "@teste.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Ana","email":"%s","senha":"senha12345"}""".formatted(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","senha":"errada123"}""".formatted(email)))
                .andExpect(status().isUnauthorized());
        return "Bearer " + JsonPath.read(body, "$.token");
    }

    private String json(String token, org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder req,
                        String content, int esperado) throws Exception {
        if (content != null) req.contentType(MediaType.APPLICATION_JSON).content(content);
        return mvc.perform(req.header("Authorization", token))
                .andExpect(status().is(esperado))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    void semTokenDa401() throws Exception {
        mvc.perform(get("/api/metas")).andExpect(status().isUnauthorized());
    }

    @Test
    void fluxoCompleto() throws Exception {
        String token = registrar();
        String prazo = LocalDate.now().plusMonths(6).toString();

        String meta = json(token, post("/api/metas"), """
                {"nome":"Notebook","valorAlvo":1000,"prazo":"%s"}""".formatted(prazo), 201);
        Integer metaId = JsonPath.read(meta, "$.id");

        String aporte = json(token, post("/api/metas/" + metaId + "/aportes"), """
                {"valor":250}""", 201);
        Integer aporteId = JsonPath.read(aporte, "$.id");
        json(token, post("/api/metas/" + metaId + "/aportes"), """
                {"valor":0}""", 422);

        mvc.perform(get("/api/metas/" + metaId).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.percentualAtingido").value(25.0))
                .andExpect(jsonPath("$.status").value("ATIVA"))
                .andExpect(jsonPath("$.prazo").value(prazo))
                .andExpect(jsonPath("$.criadaEm").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.estimativaConclusao").isString());
        mvc.perform(get("/api/metas/" + metaId + "/aportes").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(aporteId));

        json(token, post("/api/simulacoes/juros-compostos"), """
                {"capital":1000,"taxaMensal":1,"meses":12}""", 200);
        json(token, post("/api/simulacoes/parcelamento"), """
                {"valor":1000,"taxaMensal":-1,"parcelas":12}""", 422);
        mvc.perform(get("/api/simulacoes").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].resultado.montante").value(1126.83))
                .andExpect(jsonPath("$[0].tipo").value("JUROS_COMPOSTOS"))
                .andExpect(jsonPath("$[0].criadaEm").isString());

        mvc.perform(get("/api/modulos").header("Authorization", token)).andExpect(jsonPath("$", hasSize(6)));
        json(token, post("/api/conteudos/1/concluir"), null, 204);
        json(token, post("/api/conteudos/1/concluir"), null, 204);
        json(token, post("/api/conteudos/9999/concluir"), null, 404);
        mvc.perform(get("/api/modulos/1/conteudos").header("Authorization", token))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].concluido").value(true))
                .andExpect(jsonPath("$[1].concluido").value(false));
        mvc.perform(get("/api/progresso/conteudos").header("Authorization", token))
                .andExpect(jsonPath("$[0].total").value(2))
                .andExpect(jsonPath("$[0].percentual").value(50.0));

        mvc.perform(get("/api/dashboard").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEconomizado").value(250))
                .andExpect(jsonPath("$.metasAtivas").value(1))
                .andExpect(jsonPath("$.progressoConteudos[0].concluidos").value(1))
                .andExpect(jsonPath("$.ultimasSimulacoes", hasSize(1)));
        mvc.perform(get("/api/dashboard/evolucao-aportes?meses=3").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[2].mes").value(java.time.YearMonth.now().toString()))
                .andExpect(jsonPath("$[2].total").value(250));

        json(token, delete("/api/metas/" + metaId), null, 204);
        json(token, get("/api/metas/" + metaId), null, 404);
    }

    @Test
    void metaDeOutroUsuarioDa404() throws Exception {
        String dono = registrar();
        String outro = registrar();
        String meta = json(dono, post("/api/metas"), """
                {"nome":"Carro","valorAlvo":5000,"prazo":"%s"}""".formatted(LocalDate.now().plusYears(1)), 201);
        Integer id = JsonPath.read(meta, "$.id");

        json(outro, get("/api/metas/" + id), null, 404);
        json(outro, delete("/api/metas/" + id), null, 404);
        json(dono, get("/api/metas/" + id), null, 200);
    }
}
