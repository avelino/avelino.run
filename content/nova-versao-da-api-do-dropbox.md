Title: Nova versão da API do Dropbox
Date: 2011-10-13 22:47
Author: avelino
Category: Avelino
Slug: nova-versao-da-api-do-dropbox

Dia 14.09.2011 o Dropbox lançou a nova versão 1.0 da API, nesse
lançamento trouxe muitas novidades e melhorias:

-   Suporte para aplicações web
-   Suporte para criação de pasta (Na versão 0.1 da API não tinha)
-   Novo site para desenvolvedores, com documentação simples e completa
    <https://www.dropbox.com/developers_beta>
-   Melhor compartilhamento de arquivo, streaming, busca por arquivo e
    suporte para revisão de arquivo
-   Implementação no controle de nomes de arquivos, para não
    sobrescrever arquivos já salvo
-   SDK atualizado para iOS, Android, Python, Ruby e Java que implementa
    todas modificações e documentação

Link do repositorio (Python Pypi) da nova biblioteca
<http://pypi.python.org/pypi/dropbox/1.1>

O dropbox implementou um oauth onde podemos desenvolver software e fazer
o usuário usar a conta de dropbox dele para armazenamento de arquivos:  
![OAuth Dropbox][]

Vou falar um pouco sobre 3 metodos que esta dentro da biblioteca
"dropbox" client, rest e session:

Com o metodo session é por onde tudo começa, onde você linka o seu
software com uma conta Dropbox, exemplo:

    # Include the Dropbox SDK libraries
    from dropbox import session

    # Get your app key and secret from the Dropbox developer website
    APP_KEY = 'INSERT_APP_KEY_HERE'
    APP_SECRET = 'INSERT_SECRET_HERE'

    # ACCESS_TYPE should be 'dropbox' or 'app_folder' as configured for your app
    ACCESS_TYPE = 'INSERT_ACCESS_TYPE_HERE'
    sess = session.DropboxSession(APP_KEY, APP_SECRET, ACCESS_TYPE)

Caso esteja usando a conta do Dropbox do usuário podemos pegar
informações da conta dele:

    client = client.DropboxClient(sess)
    print "linked account:", client.account_info()

Agora usando o metodo "client" podemos fazer get e put de arquivos:

    from dropbox import client
    f = open('working-draft.txt')
    response = client.put_file('/magnum-opus.txt', f)
    print "uploaded:", response

Após criar o arquivos podemos ler ele:

    print client.get_file('/magnum-opus.txt').read()

Reescrever o arquivo com uma nova revisão para criar um novo arquivo:

    out = open('magnum-opus.txt', 'w')
    out.write(client.get_file('/magnum-opus.txt',rev='362e2029684fe').read())

Para trabalhar com REST temos um ótima documentação
<https://www.dropbox.com/developers_beta/reference/api>

  [OAuth Dropbox]: https://www.dropbox.com/static/images/oauth.png
    "OAuth Dropbox"
