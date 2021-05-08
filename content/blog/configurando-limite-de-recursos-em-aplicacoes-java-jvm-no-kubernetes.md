+++
date = "2021-05-01"
title = "Configurando limite de recursos em aplicações Java (JVM) no Kubernetes"
tags = ["java", "jvm", "kubernetes", "heapsize", "permsize"]
url = "configurando-limite-de-recursos-em-aplicacoes-java-jvm-no-kubernetes"
images = ["/blog/jvm-xms-xmx-heapsize.png"]
+++

Fazer deploy de software desenvolvido usando tecnologias que foram criadas para ter escalabilidade vertical para escalar horizontalmente (_micro serviço, nano serviço_ e etc) em produção pode gerar alguns desafios que não estamos preparados. Principalmente quando o software esta rodando em JVM e não foi declarado limites de recursos.

> Blogpost escrito com experiência adquirida no [Soluevo](https://soluevo.com.br/) - desenvolvendo software para processar grande volume de dados.
> A _Soluevo_ tem vaga (**de júnior a sênior**) para pessoal desenvolvedora que conheça e queira trabalhar com **Java**, veja [aqui as vagas](https://www.notion.so/soluevo/861ba87abf194a669eba94b8f47d8cbc?v=fd32972a433948ceaf0c2cf3223a3d42).

## `-Xms`, `-Xmx` e seus problemas

Ao estudar sobre a JVM você provavelmente passara pelos parâmetros de alocação inicial (`Xms`) e alocação máxima (`Xmx`) de memória, os parâmetros funcionam rigorosamente bem. Trazendo um exemplo, ao definir `-Xms128M` e `Xmx256M`, e começar monitorar a aplicação com [VisualVM](https://visualvm.github.io/), você alguma como essa:

![VisualVM declarado Xms e Xmx na JVM](/blog/jvm-xms-xmx-heapsize.png#center)

```shell
java -Xms128m -Xmx256m hello.java
```

Ao ler a documentação da JVM (a parte de [Sizing the Generations](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/sizing.html)) parece que funcionara como magica, no exemplo acima a aplicação querer mínimo de 128Mb de memória (JVM alocará assim que a aplicação iniciar), mas não deixando passar do limite de 256Mb. Vamos dar uma olhada como ficou na prática:

![Usando Xms e -Xmx na JVM](/blog/jvm-htop-xms-xmx.png#center)

```java
public class Hello {
    public static void main(String[] args) throws Exception {
        while (true) {
            new Hello().hello();
            Thread.sleep(1000);
        }
    }

    public void hello() {
        System.out.println("Hello, World");
    }
}
```

😱 não saiu como eu imaginava, parece que usou um pouco mais que 256Mb... O motivo desse comportamento é que a **JVM usa memória para outros processos** como metaspace, cache de código e etc, o `Xmx` limita só sua aplicação não a JVM como todo.

## Alguns cuidados que precisamos ter ao limitar recursos

Ao rodar software dentro do Kubernetes, temos que ter atenção no limite físico das máquinas que fazem parte do Cluster Kubernetes, para um pod não consumir todo recurso e outros pods acabar _"morrendo"_.

Vou testar exemplificar...

### Configurando `Xms` e `Xmx` na imagem Docker

Você pode passar estas flags (parâmetros) para JVM subir seu **JAR** na imagem Docker:

```dockerfile
# Dockerfile
# ...
ENTRYPOINT ["java", "-Xms128M ", "-Xmx256m", "-jar", "hello-service-1.0.0.jar"]
```

Caso esteja usando [**Jib**](https://github.com/GoogleContainerTools/jib), pode declarar dentro do `build.gradle`:

```gradle
// build.gradle
jib {
    to {
        image = "hello-service:tag"
    }
    container {
        environment = ["JAVA_TOOL_OPTIONS": "-Xms128M -Xmx256M"]
    }
}
```

### Limitando memória dos pods no Kubernetes

Ao usar `Xmx` no pods você pode facilmente chegar em uma configuração que causará restart contante, por motivos de [_Exceed a Container's memory limit (OOM)_
](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/#exceed-a-container-s-memory-limit), por motivos a limite de memória, lembre do printscreen acima que mesmo limitando a aplicação a **256Mb** a JVM usou mais de **700Mb**. Dependendo do seu software deve ser definido o limite de recurso no próprio Kubernetes no `YAML` do seu deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
# ...
spec:
  # ...
  template:
    # ...
    spec:
      containers:
        - image: hello-service:tag
          name: hello-service
          livenessProbe:
            initialDelaySeconds: 300
          resources:
            requests:
              memory: 128Mi
            limits:
              memory: 256Mi
```

Vou assumir que você declarou os limites acima para seus pods, já que você também declarou os mesmos limites na sua imagem Docker via flags `-Xms` e  `-Xmx`. Você faz deploy do seu software, ele funciona _"perfeitamente"_, como não teve problema vai para cama descansar (geralmente colocar software em produção é cansativo). No dia seguinte você da roda `kubectl get pods` para ter orgulho de ter colocado seu software no ~~Kubernetes~~ e se depara com isso:

```shell
❯ ~ kubectl get pods
NAME                              READY   STATUS    RESTARTS   AGE
hello-service-3x85997760-qapo7     1/1     Running   156        9h
```

💣 você não esperava ver isso né? Agora que conhece como funciona a JVM (com printscren do htop) você já sabe o que esta acontecendo: o uso de memória da JVM não é só do seu software, então ele é morto diversas vezes (campo RESTARTS do `get pods`) porquê o pod passou do limite de memória declarado e entra em um fluxo sem fim de _restart_.

## Abordagem correta

Primeiro de tudo: assumiremos que os limites dentro da sua imagem Docker estejam bem definidos - com o que o software realmente precisa. Caso você queira reservar um valor fixo de memória para seu software e não ter concorrência com outro, você deve declarar `Xms` = `Xmx`, mas _use com moderação_.

Para evitar _Exceed a Container's memory limit_ no pods do Kubernetes, você deve considerar os seguintes itens:

1. `requests` (parâmetro do `resources`) != `Xms` - o valor do `requests` deve ser maior que `Xms`, essa diferença depende do que seu software fará. Caso seja um _micro serviço_ "simples", ~30% de acréscimo é o suficiente, mas se seu software tem muitas conexões externas ou qualquer operação que consome memória recomendo estudar a particularidade do seu software;
2. `limits` (parâmetro do `resources`) != `Xmx` - O limite de memória sugerido para seu pod depende de muitas coisas e a imagem base do Java usada é um fator extremamente importante. Não vou passar um valor nem fórmula ~~magica~~, recomendo fazer **diversos benchmarks para conhecer melhor o software que esta desenvolvendo**;
3. Declarar `limits` com valores mais alto no começo é sempre uma boa prática, mas ir otimizando (diminuindo ou aumentando) conforme for conhecendo o comportamento do seu software em produção, sempre monitorando se o pod não entra em OOM;
4. `livenessProbe.initialDelaySeconds` - Tempo que o Kubernetes deve esperar seu software subir (JVM) antes de dar que não funcionou. Esse parâmetro é complicado, JVM tem fama de ser "lenta" para fazer boot, se seu software tem muitas conexões externas ela levará mais tempo.

Olhando para o caso que foi descrito acima: declarar `requests` como ~320Mb e `limits` como ~512Mb seria um ótimo começo dado os valores do `Xms` e `Xmx`.

> **Não existe bala de prata**, a melhor forma de chegar em valores reais para limites de recursos no Kubernetes é conhecer seu software e fazer **benchmarks** para entender o comportamento dele, acada software é único e se comporta de uma forma diferente.

> Recentemente coloquei um micro serviço usando [Spring Boot](https://spring.io/projects/spring-boot) para rodar e o serviço não subia, depois de horas e horas debugando e "brigando" com limite recurso do software e Kubernetes percebi que o problema era o `initialDelaySeconds`. _#ficaadica_
