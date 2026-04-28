-- Migration : table de sessions pour les tokens API
-- À exécuter une seule fois sur le serveur :
--   mysql -u lyceepad_user -p lyceepad_db < sessions.sql

CREATE TABLE IF NOT EXISTS sessions (
    token         VARCHAR(64)  NOT NULL PRIMARY KEY,
    id_utilisateur INT         NOT NULL,
    expires_at    DATETIME     NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expires_at (expires_at),
    CONSTRAINT fk_sessions_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
