package br.edu.financeedu;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class ApiIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

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
                .andExpect(jsonPath("$.status").value("ATIVA"));
        mvc.perform(get("/api/metas/" + metaId + "/aportes").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(aporteId));

        json(token, post("/api/simulacoes/juros-compostos"), """
                {"capital":1000,"taxaMensal":1,"meses":12}""", 200);
        json(token, post("/api/simulacoes/parcelamento"), """
                {"valor":1000,"taxaMensal":-1,"parcelas":12}""", 422);
        mvc.perform(get("/api/simulacoes").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].resultado.montante").value(1126.83));

        mvc.perform(get("/api/modulos").header("Authorization", token)).andExpect(jsonPath("$", hasSize(6)));
        json(token, post("/api/conteudos/1/concluir"), null, 204);
        json(token, post("/api/conteudos/1/concluir"), null, 204);
        json(token, post("/api/conteudos/9999/concluir"), null, 404);

        mvc.perform(get("/api/dashboard").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEconomizado").value(250))
                .andExpect(jsonPath("$.metasAtivas").value(1))
                .andExpect(jsonPath("$.progressoConteudos[0].concluidos").value(1))
                .andExpect(jsonPath("$.ultimasSimulacoes", hasSize(1)));
        mvc.perform(get("/api/dashboard/evolucao-aportes?meses=3").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(3)))
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
