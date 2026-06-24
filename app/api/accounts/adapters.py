from allauth.account.adapter import DefaultAccountAdapter


class AccountAdapter(DefaultAccountAdapter):
    """
    Adapter do allauth para o Trocai.

    O username nao e escolhido nem visto pelo usuario: a conta e baseada em
    email. Aqui geramos um username unico automaticamente a partir do prefixo
    do email (com sufixo numerico em caso de colisao), para que dois emails com
    o mesmo prefixo nunca quebrem o cadastro.
    """

    def populate_username(self, request, user):
        from allauth.account.utils import user_email

        email = (user_email(user) or "").strip()
        base = email.split("@")[0] or "usuario"
        # generate_unique_username ja adiciona sufixo numerico se necessario.
        user.username = self.generate_unique_username([base, "usuario"])
