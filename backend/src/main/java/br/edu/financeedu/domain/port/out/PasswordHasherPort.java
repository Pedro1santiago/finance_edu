package br.edu.financeedu.domain.port.out;

public interface PasswordHasherPort {
    String hash(String senha);

    boolean confere(String senha, String hash);
}
