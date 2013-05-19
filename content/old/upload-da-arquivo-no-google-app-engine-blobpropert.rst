Upload da arquivo no Google App Engine (BlobProperty)
#####################################################
:date: 2011-04-23 22:43
:author: avelino
:category: Avelino
:slug: upload-da-arquivo-no-google-app-engine-blobpropert

Essa semana que passou tive uma necessidade para um sistema de trabalhar
com UPLOAD de arquivos, ate ai é simples, só que o sistema estava em
Google App Engine, depois de apanhar um pouco resolvi fazer um post aqui
no Blog para deixar documentado como não é complicado trabalhar com
*BlobProperty* no *BigTable*.

Primeiro vamos criar um Modal onde vai ter dois campo o arquivo e o
mimetype dele:

::

    class DatastoreFile(db.Model):
        data = db.BlobProperty(required=True)
        mimetype = db.StringProperty(required=True)

Agora vamos criar a views onde ele vai processar o formulario e o POST
do formulario:

::

    class MainHandler(webapp.RequestHandler):
        def get(self):
            self.response.out.write(template.render("upload.html", {}))

        def post(self):
            file = self.request.POST['file']

            entity = DatastoreFile(data=file.value, mimetype=file.type)
            entity.put()

            file_url = "http://%s/%d/%s" % (self.request.host, entity.key().id(), file.name)
            self.response.out.write("Your uploaded file is now available at %s" % (file_url,))

Podemos notar que na definição get() temos apenas a renderização do
"upload.html", o conteudo dele é bem simples, temos um input do tipo
file e outro submit:

::

    <html>
    <head>
      <title>File Upload</title>
    </head>
    <body>
      <form method="post" action="/" enctype="multipart/form-data">
        <input type="file" name="file" />
        <input type="submit" value="Upload" />
      </form>
    </body>
    </html>

Falando da definição post() que esta na classe MainHandler ela que faz o
trabalho de fazer o UPLOAD do arquivo para dentro do *BlobProperty*, é
um processo bem simples, a variável "file" recebe o POST do input file,
depois disso chamamos o modal que tem o nome de DatastoreFile passando
dois parâmetros que é os dois campos criados, o data e mimetype, depois
disso é só fazer o put() que seja salvo no banco de dados. Dentro do
post() eu gero o link para download do arquivo na variável file\_url,
onde passo o HOST (url do sistema), id() (do arquivo que foi feito
upload) e file name (Nome do campo que recebeu o arquivo).

Agora temos que fazer a classe para download do arquivo onde vamos mudar
o Content-Type do response para o mime-type do arquivo que foi feito o
upload, exemplo: fiz o upload de um arquivo no formato JPG o mime type
dele é "image/jpeg", então tenho que fazer o responser renderizar em
formatado "image/jpeg".

Na URL que montamos para download passamos a seguinte informação id e
file name onde temos que criar uma definição get() que receba essas
informações:

::

    class DownloadHandler(webapp.RequestHandler):
        def get(self, id, filename):
            entity = DatastoreFile.get_by_id(int(id))
            self.response.headers['Content-Type'] = entity.mimetype
            self.response.out.write(entity.data)

Recebendo as duas variáveis podemos fazer um consulta no BigTable de
forma simples onde busco o id, pego o retorno do banco de dados e coloco
que o response.headers['Content-Type'] é o mime-type que esta salvo no
banco e depois é só escrever o arquivo na tela.

Agora vamos criar as rotas da URL:

::

    def main():
        application = webapp.WSGIApplication([
            ('/', MainHandler),
            ('/(\d+)/(.*)', DownloadHandler)
            ],debug=True)
        util.run_wsgi_app(application)

    if __name__ == '__main__':
        main()

Quem ainda estiver com duvida pode dar uma olhar no repositorio:
https://bitbucket.org/avelino/post_py_upload_de_arquivo_no_gae/src
