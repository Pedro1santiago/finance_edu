package br.edu.financeedu.domain.model;

import br.edu.financeedu.domain.exception.RegraNegocioException;

public final class Texto {

    private Texto() {
    }

    public static boolean temControle(String texto) {
        return texto != null && texto.codePoints().anyMatch(Character::isISOControl);
    }

    public static void semControle(String texto, String campo) {
        if (temControle(texto)) throw new RegraNegocioException(campo + " não pode ter caracteres de controle");
    }
}
