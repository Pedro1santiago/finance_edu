package br.edu.financeedu.domain.port.out;

import br.edu.financeedu.domain.model.Usuario;

public interface TokenPort {
    String gerar(Usuario usuario);
}
