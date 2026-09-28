const {PrismaClient}=require("@prisma/client");
const prisma=new PrismaClient();
const oa34=require("./catalogs/oa-3-4-basico.cjs");
const oaLCPO=require("./catalogs/oa-lengua-cultura-pueblos-originarios-1-6.cjs");
const oa56=require("./catalogs/oa-5-6-basico.cjs");
const oa7=require("./catalogs/oa-7-basico.cjs");
const oa12m=require("./catalogs/oa-1-2-medio.cjs");
const oa34mHC=require("./catalogs/oa-3-4-medio-hc.cjs");
const oa34mHCSciences=require("./catalogs/oa-3-4-medio-hc-ciencias.cjs");
const oa34mHCVerifiedExtra=require("./catalogs/oa-3-4-medio-hc-verified-extra.cjs");
const oa34mHCMathLanguage=require("./catalogs/oa-3-4-medio-hc-matematica-lengua.cjs");
const oa34mHCHistoryPhilosophy=require("./catalogs/oa-3-4-medio-hc-historia-filosofia.cjs");
const oa34mHCPhilosophyExtra=require("./catalogs/oa-3-4-medio-hc-filosofia-extra.cjs");
const oa34mHCGeneralElectives=require("./catalogs/oa-3-4-medio-hc-general-electives.cjs");
const tpPriority=require("./catalogs/tp-priority.cjs");
const tpModules=require("./catalogs/tp-modules-priority.cjs");
const source="Currículum Nacional · MINEDUC";
const sourceUrl1to6="https://www.curriculumnacional.cl/curriculum/1o-6o-basico";
const sourceUrl7to2m="https://www.curriculumnacional.cl/curriculum/7o-basico-2-medio";
const sourceUrl3to4m="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
// Every block is checked against an expected total before it is persisted.
// Keep this seed additive: new verified blocks are appended; existing levels are never replaced wholesale.
const science1=[
["CN01 OA 01","Reconocer y observar, por medio de la exploración, que los seres vivos crecen, responden a estímulos del medio, se reproducen y necesitan agua, alimento y aire para vivir, comparándolos con las cosas no vivas."],
["CN01 OA 02","Observar y comparar animales de acuerdo a características como tamaño, cubierta corporal, estructuras de desplazamiento y hábitat, entre otras."],
["CN01 OA 03","Observar e identificar, por medio de la exploración, las estructuras principales de las plantas: hojas, flores, tallos y raíces."],
["CN01 OA 04","Observar y clasificar semillas, frutos, flores y tallos a partir de criterios como tamaño, forma, textura y color, entre otros."],
["CN01 OA 05","Reconocer y comparar diversas plantas y animales de nuestro país, considerando las características observables, y proponiendo medidas para su cuidado."],
["CN01 OA 06","Identificar y describir la ubicación y la función de los sentidos proponiendo medidas para protegerlos y para prevenir situaciones de riesgo."],
["CN01 OA 07","Describir, dar ejemplos y practicar hábitos de vida saludable para mantener el cuerpo sano y prevenir enfermedades (actividad física, aseo del cuerpo, lavado de alimentos y alimentación saludable, entre otros)."],
["CN01 OA 08","Explorar y describir los diferentes tipos de materiales en diversos objetos, clasificándolos según sus propiedades (goma-flexible, plástico-impermeable) e identificando su uso en la vida cotidiana."],
["CN01 OA 09","Observar y describir los cambios que se producen en los materiales al aplicarles fuerza, luz, calor y agua."],
["CN01 OA 10","Diseñar instrumentos tecnológicos simples considerando diversos materiales y sus propiedades para resolver problemas cotidianos."],
["CN01 OA 11","Describir y registrar el ciclo diario y las diferencias entre el día y la noche, a partir de la observación del Sol, la Luna, las estrellas y la luminosidad del cielo, entre otras, y sus efectos en los seres vivos y el ambiente."],
["CN01 OA 12","Describir y comunicar los cambios del ciclo de las estaciones y sus efectos en los seres vivos y el ambiente."]
];
const mathematics8=[
["MA08 OA 01","Mostrar que comprenden la multiplicación y la división de números enteros: representándolos de manera concreta, pictórica y simbólica; aplicando procedimientos usados en la multiplicación y la división de números naturales; aplicando la regla de los signos de la operación; resolviendo problemas rutinarios y no rutinarios."],
["MA08 OA 02","Utilizar las operaciones de multiplicación y división con los números racionales en el contexto de la resolución de problemas: representándolos en la recta numérica; involucrando diferentes conjuntos numéricos (fracciones, decimales y números enteros)."],
["MA08 OA 03","Explicar la multiplicación, la división y el proceso de formar potencias de potencias de base natural y exponente natural hasta 3, de manera concreta, pictórica y simbólica."],
["MA08 OA 04","Mostrar que comprenden las raíces cuadradas de números naturales: estimándolas de manera intuitiva; representándolas de manera concreta, pictórica y simbólica; aplicándolas en situaciones geométricas y en la vida diaria."],
["MA08 OA 05","Resolver problemas que involucran variaciones porcentuales en contextos diversos, usando representaciones pictóricas y registrando el proceso de manera simbólica; por ejemplo: el interés anual del ahorro."],
["MA08 OA 06","Mostrar que comprenden las operaciones de expresiones algebraicas: representándolas de manera pictórica y simbólica; relacionándolas con el área de cuadrados, rectángulos y volúmenes de paralelepípedos; determinando formas factorizadas."],
["MA08 OA 07","Mostrar que comprenden la noción de función por medio de un cambio lineal: utilizando tablas; usando metáforas de máquinas; estableciendo reglas entre x e y; representando de manera gráfica (plano cartesiano, diagramas de Venn), de manera manual y/o con software educativo."],
["MA08 OA 08","Modelar situaciones de la vida diaria y de otras asignaturas, usando ecuaciones lineales de la forma: ax = b; x/a = b, a ≠ 0; ax + b = c; x/a + b = c; ax = b + cx; a(x + b) = c; ax + b = cx + d (a, b, c, d, e ∈ Q)."],
["MA08 OA 09","Resolver inecuaciones lineales con coeficientes racionales en el contexto de la resolución de problemas, por medio de representaciones gráficas, simbólicas, de manera manual y/o con software educativo."],
["MA08 OA 10","Mostrar que comprenden la función afín: generalizándola como la suma de una constante con una función lineal; trasladando funciones lineales en el plano cartesiano; determinando el cambio constante de un intervalo a otro, de manera gráfica y simbólica, de manera manual y/o con software educativo; relacionándola con el interés simple; utilizándola para resolver problemas de la vida diaria y de otras asignaturas."],
["MA08 OA 11","Desarrollar las fórmulas para encontrar el área de superficies y el volumen de prismas rectos con diferentes bases y cilindros: estimando de manera intuitiva área de superficie y volumen; desplegando la red de prismas rectos para encontrar la fórmula del área de superficie; aplicando las aproximaciones del perímetro y del área en la resolución de problemas; aplicando las fórmulas a la resolución de problemas geométricos y de la vida diaria."],
["MA08 OA 12","Explicar, de manera concreta, pictórica y simbólica, la validez del teorema de Pitágoras y aplicar a la resolución de problemas geométricos y de la vida cotidiana, de manera manual y/o con software educativo."],
["MA08 OA 13","Describir la posición y el movimiento (traslaciones, rotaciones y reflexiones) de figuras 2D, de manera manual y/o con software educativo, utilizando: los vectores para la traslación; los ejes del plano cartesiano como ejes de reflexión; los puntos del plano para las rotaciones."],
["MA08 OA 14","Componer rotaciones, traslaciones y reflexiones en el plano cartesiano y en el espacio, de manera manual y/o con software educativo, y aplicar a las simetrías de polígonos y poliedros, y a la resolución de problemas geométricos relacionados con el arte."],
["MA08 OA 15","Mostrar que comprenden las medidas de posición, percentiles y cuartiles: identificando la población que está sobre o bajo el percentil; representándolas con diagramas, incluyendo el diagrama de cajón, de manera manual y/o con software educativo; utilizándolas para comparar poblaciones."],
["MA08 OA 16","Evaluar la forma en que los datos están presentados: comparando la información de los mismos datos representada en distintos tipos de gráficos para determinar fortalezas y debilidades de cada uno; representándolas con diagramas, incluyendo el diagrama de cajón, de manera manual y/o con software educativo; detectando manipulaciones de gráficos para representar datos."],
["MA08 OA 17","Explicar el principio combinatorio multiplicativo: a partir de situaciones concretas; representándolo con tablas y árboles regulares, de manera manual y/o con software educativo; utilizándolo para calcular la probabilidad de un evento compuesto."]
];
const language8=[["LE08 OA 01","Leer habitualmente para aprender y recrearse, y seleccionar textos de acuerdo con sus preferencias y propósitos."],["LE08 OA 02","Reflexionar sobre las diferentes dimensiones de la experiencia humana, propia y ajena, a partir de la lectura de obras literarias y otros textos que forman parte de nuestras herencias culturales, abordando los temas estipulados para el curso y las obras sugeridas para cada uno."],["LE08 OA 03","Analizar las narraciones leídas para enriquecer su comprensión, considerando, cuando sea pertinente: el o los conflictos de la historia; los personajes, su evolución en el relato y su relación con otros personajes; la relación de un fragmento de la obra con el total; el narrador, distinguiéndolo del autor; personajes tipo, símbolos y tópicos literarios presentes en el texto; los prejuicios, estereotipos y creencias presentes en el relato y su conexión con el mundo actual; la disposición temporal de los hechos, con atención a los recursos léxicos y gramaticales empleados para expresarla; elementos en común con otros textos leídos en el año."],["LE08 OA 04","Analizar los poemas leídos para enriquecer su comprensión, considerando, cuando sea pertinente: cómo el lenguaje poético que emplea el autor apela a los sentidos, sugiere estados de ánimo y crea imágenes; el significado o el efecto que produce el uso de lenguaje figurado en el poema; el efecto que tiene el uso de repeticiones en el poema; elementos en común con otros textos leídos en el año."],["LE08 OA 05","Analizar los textos dramáticos leídos o vistos, para enriquecer su comprensión, considerando, cuando sea pertinente: el conflicto y sus semejanzas con situaciones cotidianas; los personajes principales y cómo sus acciones y dichos conducen al desenlace o afectan a otros personajes; personajes tipo, símbolos y tópicos literarios; los prejuicios, estereotipos y creencias presentes en el relato y su conexión con el mundo actual; las características del género dramático; la diferencia entre obra dramática y obra teatral; elementos en común con otros textos leídos en el año."],["LE08 OA 06","Leer y comprender fragmentos de epopeya, considerando sus características y el contexto en el que se enmarcan."],["LE08 OA 07","Leer y comprender comedias teatrales, considerando sus características y el contexto en el que se enmarcan."],["LE08 OA 08","Formular una interpretación de los textos literarios leídos o vistos, que sea coherente con su análisis, considerando: su experiencia personal y sus conocimientos; un dilema presentado en el texto y su postura personal acerca del mismo; la relación de la obra con la visión de mundo y el contexto histórico en el que se ambienta y/o en el que fue creada."],["LE08 OA 09","Analizar y evaluar textos con finalidad argumentativa como columnas de opinión, cartas y discursos, considerando: la postura del autor y los argumentos e información que la sostienen; la diferencia entre hecho y opinión; con qué intención el autor usa diversos modos verbales; su postura personal frente a lo leído y argumentos que la sustentan."],["LE08 OA 10","Analizar y evaluar textos de los medios de comunicación, como noticias, reportajes, cartas al director, textos publicitarios o de las redes sociales, considerando: los propósitos explícitos e implícitos del texto; una distinción entre los hechos y las opiniones expresados; presencia de estereotipos y prejuicios; la suficiencia de información entregada; el análisis e interpretación de imágenes, gráficos, tablas, mapas o diagramas, y su relación con el texto en el que están insertos; similitudes y diferencias en la forma en que distintas fuentes presentan un mismo hecho."],["LE08 OA 11","Leer y comprender textos no literarios para contextualizar y complementar las lecturas literarias realizadas en clases."],["LE08 OA 12","Aplicar estrategias de comprensión de acuerdo con sus propósitos de lectura: resumir; formular preguntas; analizar los distintos tipos de relaciones que establecen las imágenes o el sonido con el texto escrito (en textos multimodales)."],["LE08 OA 13","Expresarse en forma creativa por medio de la escritura de textos de diversos géneros, escogiendo libremente: el tema; el género; el destinatario."],["LE08 OA 14","Escribir, con el propósito de explicar un tema, textos de diversos géneros, caracterizados por: una presentación clara del tema en que se esbozan los aspectos que se abordarán; la presencia de información de distintas fuentes; la inclusión de hechos, descripciones, ejemplos o explicaciones que desarrollen el tema; una progresión temática clara, con especial atención al empleo de recursos anafóricos; el uso de imágenes u otros recursos gráficos pertinentes; un cierre coherente con las características del género; el uso de referencias según un formato previamente acordado."],["LE08 OA 15","Escribir, con el propósito de persuadir, textos breves de diversos géneros, caracterizados por: la presentación de una afirmación referida a temas contingentes o literarios; la presencia de evidencias e información pertinente; la mantención de la coherencia temática."],["LE08 OA 16","Planificar, escribir, revisar, reescribir y editar sus textos en función del contexto, el destinatario y el propósito: recopilando información e ideas y organizándolas antes de escribir; adecuando el registro, el uso de la persona gramatical y la estructura del texto al género discursivo, contexto y destinatario; incorporando información pertinente; asegurando la coherencia y la cohesión del texto; cuidando la organización a nivel oracional y textual; usando conectores adecuados; usando un vocabulario variado y preciso; reconociendo y corrigiendo usos inadecuados; corrigiendo la ortografía y mejorando la presentación; usando eficazmente las herramientas del procesador de textos."],["LE08 OA 17","Usar adecuadamente oraciones complejas: manteniendo un referente claro; conservando la coherencia temporal; ubicando el sujeto, para determinar de qué o quién se habla."],["LE08 OA 18","Construir textos con referencias claras: usando recursos de correferencia como deícticos y nominalización, sustitución pronominal y elipsis, entre otros; analizando si los recursos de correferencia utilizados evitan o contribuyen a la pérdida del referente, cambios de sentido o problemas de estilo."],["LE08 OA 19","Conocer los modos verbales, analizar sus usos y seleccionar el más apropiado para lograr un efecto en el lector, especialmente al escribir textos con finalidad persuasiva."],["LE08 OA 20","Escribir correctamente para facilitar la comprensión al lector: aplicando todas las reglas de ortografía literal y acentual; verificando la escritura de las palabras cuya ortografía no está sujeta a reglas; usando correctamente punto, coma, raya y dos puntos."],["LE08 OA 21","Comprender, comparar y evaluar textos orales y audiovisuales tales como exposiciones, discursos, documentales, noticias, reportajes, etc., considerando: su postura personal frente a lo escuchado y argumentos que la sustenten; los temas, conceptos o hechos principales; el contexto en el que se enmarcan los textos; prejuicios expresados en los textos; una distinción entre los hechos y las opiniones expresados; diferentes puntos de vista expresados en los textos; las relaciones que se establecen entre imágenes, texto y sonido; relaciones entre lo escuchado y los temas y obras estudiados durante el curso."],["LE08 OA 22","Dialogar constructivamente para debatir o explorar ideas: manteniendo el foco; demostrando comprensión de lo dicho por el interlocutor; fundamentando su postura de manera pertinente; formulando preguntas o comentarios que estimulen o hagan avanzar la discusión o profundicen un aspecto del tema; negociando acuerdos con los interlocutores; reformulando sus comentarios para desarrollarlos mejor; considerando al interlocutor para la toma de turnos."],["LE08 OA 23","Expresarse frente a una audiencia de manera clara y adecuada a la situación para comunicar temas de su interés: presentando información fidedigna y que denota una investigación previa; siguiendo una progresión temática clara; recapitulando la información más relevante o más compleja para asegurarse de que la audiencia comprenda; usando un vocabulario variado y preciso y evitando el uso de muletillas; usando conectores adecuados para hilar la presentación; usando material visual que apoye lo dicho y se relacione directamente con lo que se explica."],["LE08 OA 24","Usar conscientemente los elementos que influyen y configuran los textos orales: comparando textos orales y escritos para establecer las diferencias, considerando el contexto y el destinatario; demostrando dominio de los distintos registros y empleándolos adecuadamente según la situación; utilizando estrategias que permiten cuidar la relación con el otro, especialmente al mostrar desacuerdo; utilizando un volumen, una velocidad y una dicción adecuados al propósito y a la situación."],["LE08 OA 25","Realizar investigaciones sobre diversos temas para complementar sus lecturas o responder interrogantes relacionadas con el lenguaje y la literatura: delimitando el tema de investigación; aplicando criterios para determinar la confiabilidad de las fuentes consultadas; usando los organizadores y la estructura textual para encontrar información de manera eficiente; evaluando si los textos entregan suficiente información para responder una determinada pregunta o cumplir un propósito; descartando fuentes que no aportan a la investigación porque se alejan del tema; organizando en categorías la información encontrada en las fuentes investigadas; registrando la información bibliográfica de las fuentes consultadas; elaborando un texto oral o escrito bien estructurado que comunique sus hallazgos."],["LE08 OA 26","Sintetizar, registrar y ordenar las ideas principales de textos escuchados o leídos para satisfacer propósitos como estudiar, hacer una investigación, recordar detalles, etc."]];

const science8=[
["CN08 OA 01","Explicar que los modelos de la célula han evolucionado sobre la base de evidencias, como las aportadas por científicos como Hooke, Leeuwenhoek, Virchow, Schleiden y Schwann."],
["CN08 OA 02","Desarrollar modelos que expliquen la relación entre la función de una célula y sus partes, considerando: sus estructuras (núcleo, citoplasma, membrana celular, pared celular, vacuolas, mitocondria, cloroplastos, entre otros); células eucariontes (animal y vegetal) y procariontes; tipos celulares (como intestinal, muscular, nervioso, pancreático)."],
["CN08 OA 03","Explicar, por medio de la experimentación, los mecanismos de intercambio de partículas entre la célula (en animales y plantas) y su ambiente por difusión y osmosis."],
["CN08 OA 04","Crear modelos que expliquen que las plantas tienen estructuras especializadas para responder a estímulos del medioambiente, similares a las del cuerpo humano, considerando los procesos de transporte de sustancia e intercambio de gases."],
["CN08 OA 05","Explicar, basados en evidencias, la interacción de sistemas del cuerpo humano, organizados por estructuras especializadas que contribuyen a su equilibrio, considerando: la digestión de los alimentos por medio de la acción de enzimas digestivas y su absorción o paso a la sangre; el rol del sistema circulatorio en el transporte de sustancias como nutrientes, gases, desechos metabólicos y anticuerpos; el proceso de ventilación pulmonar e intercambio gaseoso a nivel alveolar; el rol del sistema excretor en relación con la filtración de la sangre, la regulación de la cantidad de agua en el cuerpo y la eliminación de desechos; la prevención de enfermedades debido al consumo excesivo de sustancias como tabaco, alcohol, grasas y sodio, que se relacionan con estos sistemas."],
["CN08 OA 06","Investigar experimentalmente y explicar las características de los nutrientes (carbohidratos, proteínas, grasas, vitaminas, minerales y agua) en los alimentos y sus efectos para la salud humana."],
["CN08 OA 07","Analizar y evaluar, basados en evidencias los factores que contribuyen a mantener un cuerpo saludable, proponiendo un plan que considere: una alimentación balanceada; un ejercicio físico regular; evitar consumo de alcohol, tabaco y drogas."],
["CN08 OA 08","Analizar las fuerzas eléctricas, considerando: los tipos de electricidad; los métodos de electrización (fricción, contacto e inducción); la planificación, conducción y evaluación de experimentos para evidenciar las interacciones eléctricas; la evaluación de los riesgos en la vida cotidiana y las posibles soluciones."],
["CN08 OA 09","Investigar, explicar y evaluar las tecnologías que permiten la generación de energía eléctrica, como ocurre en pilas o baterías, en paneles fotovoltaicos y en generadores (eólicos, hidroeléctricos o nucleares, entre otros)."],
["CN08 OA 10","Analizar un circuito eléctrico domiciliario y comparar experimentalmente los circuitos eléctricos en serie y en paralelo, en relación con la: energía eléctrica; diferencia de potencial; intensidad de corriente; potencia eléctrica; resistencia eléctrica; eficiencia energética."],
["CN08 OA 11","Desarrollar modelos e investigaciones experimentales que expliquen el calor como un proceso de transferencia de energía térmica entre dos o más cuerpos que están a diferentes temperaturas, o entre una fuente térmica y un objeto, considerando: las formas en que se propaga (conducción, convección y radiación); los efectos que produce (cambio de temperatura, deformación y cambio de estado, entre otros); la cantidad de calor cedida y absorbida en un proceso térmico; objetos tecnológicos que protegen de altas o bajas temperaturas a seres vivos y objetos; su diferencia con la temperatura (a nivel de sus partículas); mediciones de temperatura, usando termómetro y variadas escalas, como Celsius, Kelvin y Fahrenheit, entre otras."],
["CN08 OA 12","Investigar y analizar cómo ha evolucionado el conocimiento de la constitución de la materia, considerando los aportes y las evidencias de: la teoría atómica de Dalton; los modelos atómicos desarrollados por Thomson, Rutherford y Bohr, entre otros."],
["CN08 OA 13","Desarrollar modelos que expliquen que la materia está constituida por átomos que interactúan, generando diversas partículas y sustancias."],
["CN08 OA 14","Usar la tabla periódica como un modelo para predecir las propiedades relativas de los elementos químicos basados en los patrones de sus átomos, considerando: el número atómico; la masa atómica; la conductividad eléctrica; la conductividad térmica; el brillo; los enlaces que se pueden formar."],
["CN08 OA 15","Investigar y argumentar, en base a evidencias, que existen algunos elementos químicos más frecuentes en la Tierra que son comunes en los seres vivos y son soporte para la vida, como el carbono, el hidrógeno, el oxígeno y el nitrógeno."]
];

const history8=[
["HI08 OA 01","Analizar, apoyándose en diversas fuentes, la centralidad del ser humano y su capacidad de transformar el mundo en las expresiones culturales del Humanismo y del Renacimiento."],
["HI08 OA 02","Comparar la sociedad medieval y moderna, considerando los cambios que implicó la ruptura de la unidad religiosa de Europa, el surgimiento del Estado centralizado, el impacto de la imprenta en la difusión del conocimiento y de las ideas, la revolución científica y el nacimiento de la ciencia moderna, entre otros."],
["HI08 OA 03","Caracterizar el Estado moderno considerando sus principales rasgos, como la concentración del poder en la figura del rey, el desarrollo de la burocracia y de un sistema fiscal centralizado, la expansión del territorio, la creación de ejércitos profesionales y el monopolio del comercio internacional, y contrastar con la fragmentación del poder que caracterizó a la Edad Media."],
["HI08 OA 04","Caracterizar la economía mercantilista del siglo XVI, considerando fenómenos económicos como la acumulación y circulación de metales preciosos, la ampliación de rutas comerciales, la expansión mundial de la economía europea, la revolución de los precios y el aumento de la competencia, entre otros."],
["HI08 OA 05","Argumentar por qué la llegada de los europeos a América implicó un enfrentamiento entre culturas, considerando aspectos como la profundidad de las diferencias culturales, la magnitud del escenario natural americano, y la desarticulación de la cosmovisión de las sociedades indígenas."],
["HI08 OA 06","Analizar los factores que explican la rapidez de la conquista y la caída de los grandes imperios americanos, considerando aspectos como la organización política, las diferencias en la forma de hacer la guerra, los intereses de los conquistadores y la catástrofe demográfica."],
["HI08 OA 07","Analizar y evaluar el impacto de la conquista de América en la cultura europea, considerando la ampliación del mundo conocido, el desafío de representar una nueva realidad y los debates morales relacionados con la condición humana de los indígenas."],
["HI08 OA 08","Analizar el rol de la ciudad en la administración del territorio del Imperio español, considerando las instituciones que concentraba, la relación con la metrópoli, el monopolio del comercio y la consolidación del poder local de las elites criollas."],
["HI08 OA 09","Caracterizar el barroco a través de distintas expresiones culturales de la sociedad colonial, como el arte, la arquitectura, la música, el teatro y las ceremonias, entre otros."],
["HI08 OA 10","Explicar la importancia de los mercados americanos en el comercio atlántico de los siglos XVII y XVIII, considerando el monopolio comercial, la exportación de materias primas, las distintas regiones productivas, el tráfico y empleo masivo de mano de obra esclava y el desarrollo de rutas comerciales."],
["HI08 OA 11","Analizar el proceso de formación de la sociedad colonial americana considerando elementos como la evangelización, la esclavitud y otras formas de trabajo no remunerado (por ejemplo, encomienda y mita), los roles de género, la transculturación, el mestizaje, la sociedad de castas, entre otros."],
["HI08 OA 12","Analizar y evaluar las formas de convivencia y los tipos de conflicto que surgen entre españoles, mestizos y mapuches como resultado del fracaso de la conquista de Arauco, y relacionar con el consiguiente desarrollo de una sociedad de frontera durante la Colonia en Chile."],
["HI08 OA 13","Analizar el rol de la hacienda en la conformación de los principales rasgos del Chile colonial, considerando el carácter rural de la economía, el desarrollo de un sistema de inquilinaje, la configuración de una elite terrateniente y de una sociedad con rasgos estamentales, y reconocer la proyección de estos elementos en los siglos XIX y XX."],
["HI08 OA 14","Caracterizar la Ilustración como corriente de pensamiento basada en la razón, considerando sus principales ideas tales como el ordenamiento constitucional, la separación y el equilibrio de poderes del Estado, los principios de libertad, igualdad y soberanía popular y la secularización, y fundamentar su rol en la crítica al absolutismo y en la promoción del ideario republicano."],
["HI08 OA 15","Analizar cómo las ideas ilustradas se manifestaron en los procesos revolucionarios de fines del siglo XVIII y comienzos del siglo XIX, considerando la independencia de Estados Unidos, la Revolución Francesa y las independencias de las colonias españolas en Latinoamérica."],
["HI08 OA 16","Explicar la independencia de las colonias hispanoamericanas como un proceso continental, marcado por la crisis del sistema colonial, la apropiación de las ideas ilustradas y la opción por el modelo republicano, y analizar en este marco el proceso de Independencia de Chile."],
["HI08 OA 17","Contrastar las distintas posturas que surgieron en el debate sobre la legitimidad de la conquista durante el siglo XVI, y fundamentar la relevancia de este debate para la concepción de los derechos humanos en la actualidad."],
["HI08 OA 18","Explicar el concepto de derechos del hombre y del ciudadano difundido en el marco de la Ilustración y la Revolución francesa, y reconocer su vigencia actual en los derechos humanos."],
["HI08 OA 19","Evaluar las principales transformaciones y desafíos que generó la independencia de Chile, como la conformación de un orden republicano, la constitución de una ciudadanía inspirada en la soberanía popular y la formación de un Estado nacional, y fundamentar la relevancia de estas transformaciones para el Chile de la actualidad."],
["HI08 OA 20","Explicar los criterios que definen a una región, considerando factores físicos y humanos que la constituyen (por ejemplo, vegetación, suelo, clima, lengua común, religión, historia, entre otros), y dar ejemplos de distintos tipos de regiones en Chile y en América (culturales, geográficas, económicas, político-administrativas, etc.)."],
["HI08 OA 21","Analizar y evaluar problemas asociados a la región en Chile -como los grados de conexión y de aislamiento (considerando redes de transporte y comunicaciones, acceso a bienes, servicios e información, entre otros), índices demográficos y migración- y su impacto en diversos ámbitos (mercado laboral, servicios de salud, relación campo-ciudad y centro-periferia, entre otros)."],
["HI08 OA 22","Aplicar el concepto de desarrollo para analizar diversos aspectos de las regiones en Chile, considerando el índice de desarrollo humano, la diversidad productiva, de intercambio y de consumo, las ventajas comparativas, la inserción en los mercados internacionales, y el desarrollo sustentable."]
];


const arts8=[
["AR08 OA 01","Crear trabajos visuales basados en la apreciación y el análisis de manifestaciones estéticas referidas a la relación entre personas, naturaleza y medioambiente, en diferentes contextos."],
["AR08 OA 02","Crear trabajos visuales a partir de diferentes desafíos creativos, experimentando con materiales sustentables en técnicas de impresión, papeles y textiles."],
["AR08 OA 03","Crear trabajos visuales a partir de diferentes desafíos creativos, usando medios de expresión contemporáneos como la instalación."],
["AR08 OA 04","Analizar manifestaciones visuales patrimoniales y contemporáneas, contemplando criterios como: contexto, materialidad, lenguaje visual y propósito expresivo."],
["AR08 OA 05","Evaluar trabajos visuales personales y de sus pares, considerando criterios como: materialidad, lenguaje visual y propósito expresivo."],
["AR08 OA 06","Comparar y valorar espacios de difusión de las artes visuales, considerando: medios de expresión presentes, espacio, montaje, público y aporte a la comunidad."]
];
const music8=[
["MU08 OA 01","Comunicar sentimientos, sensaciones e ideas al escuchar manifestaciones y obras musicales de Chile y el mundo, presentes en la tradición, oral, escrita y popular, integrando sus conocimientos en expresiones verbales, visuales, sonoras y corporales."],
["MU08 OA 02","Describir analíticamente los elementos del lenguaje musical y los procedimientos compositivos evidentes en la música escuchada, interpretada y creada, y su relación con el propósito expresivo."],
["MU08 OA 03","Cantar y tocar repertorio relacionado con la música escuchada, desarrollando habilidades tales como comprensión rítmica, melódica, conciencia de textura y estilo, expresividad, rigurosidad, fluidez de fraseo y dinámica, entre otros."],
["MU08 OA 04","Interpretar repertorio diverso a una y más voces, con precisión rítmica y melódica, incorporando como guía el uso de medios de registro y transmisión, en la presentación de su quehacer musical."],
["MU08 OA 05","Improvisar y crear música aplicando experiencias y conocimientos a partir de indicaciones determinadas, dando énfasis a acompañamientos y variaciones rítmicas, melódicas y/o armónicas."],
["MU08 OA 06","Explicar fortalezas y áreas de crecimiento personal en la audición, interpretación, creación y reflexión, y su influencia en el trabajo musical propio y colectivo."],
["MU08 OA 07","Apreciar el rol de la música en la sociedad a partir del repertorio trabajado, respetando la diversidad y riqueza de los contextos socioculturales."]
];
const physicalEducation8=[
["EF08 OA 01","Seleccionar, combinar y aplicar con mayor dominio las habilidades motrices específicas de locomoción, manipulación y estabilidad en, al menos: Un deporte individual (atletismo, gimnasia artística, entre otros). Un deporte de oposición (tenis, bádminton, entre otros). Un deporte de colaboración (escalada, vóleibol duplas, entre otros). Un deporte de oposición/colaboración (básquetbol, hándbol, hockey, entre otros). Una danza (folclórica, moderna, entre otras)."],
["EF08 OA 02","Seleccionar, evaluar y aplicar estrategias y tácticas específicas para la resolución de problemas durante la práctica de juegos o deportes; por ejemplo: ubicar la pelota lejos de un contrincante, utilizar los espacios para recibir un objeto sin oponentes, aplicar un sistema de juego (uno contra uno, tres contra tres, entre otros), entre otros."],
["EF08 OA 03","Desarrollar la resistencia cardiovascular, la fuerza muscular, la velocidad y la flexibilidad para alcanzar una condición física saludable, considerando: Frecuencia. Intensidad. Tiempo de duración y recuperación. Progresión. Tipo de ejercicio (correr, andar en bicicleta, realizar trabajo de fuerza, ejercicios de flexibilidad, entre otros)."],
["EF08 OA 04","Practicar regularmente una variedad de actividades físicas alternativas y/o deportivas en diferentes entornos, aplicando conductas de autocuidado y seguridad, como realizar al menos 30 minutos diarios de actividades físicas de su interés, evitar el consumo de drogas, tabaco y alcohol, ejecutar un calentamiento, aplicar reglas y medidas de seguridad, hidratarse con agua de forma permanente, entre otras."],
["EF08 OA 05","Participar y promover una variedad de actividades físicas y/o deportivas de su interés y que se desarrollan en su comunidad escolar y/o en su entorno; por ejemplo: Promover la práctica regular de actividad física y deportiva. Participar en la organización de una variedad de actividades físicas y/o deportivas que sean de interés personal y de la comunidad. Utilizar estrategias para promover la práctica regular de actividad física; por ejemplo: elaborar afiches o diarios murales, entre otras."]
];
const technology8=[
["TE08 OA 01","Identificar oportunidades o necesidades personales, grupales o locales que impliquen la creación de un producto tecnológico, reflexionando acerca de sus posibles aportes."],
["TE08 OA 02","Diseñar y crear un producto tecnológico que atienda a la oportunidad o necesidad establecida, respetando criterios de eficiencia y sustentabilidad, y utilizando herramientas TIC en distintas etapas del proceso."],
["TE08 OA 03","Evaluar el producto tecnológico creado, aplicando criterios propios y técnicos, y proponer mejoras asociadas tanto a los procesos como al producto final."],
["TE08 OA 04","Comunicar el diseño, la planificación u otros procesos de la creación de productos tecnológicos, utilizando herramientas TIC, considerando diferentes tipos de objetivos y audiencias, y teniendo en cuenta aspectos éticos."],
["TE08 OA 05","Examinar soluciones tecnológicas existentes que respondan a las oportunidades o necesidades establecidas considerando los destinatarios, aspectos técnicos y funcionales."],
["TE08 OA 06","Establecer impactos positivos y/o negativos de las soluciones tecnológicas analizadas considerando aspectos éticos, ambientales y sociales, entre otros."]
];
const orientation8=[
["OR08 OA 01","Construir, en forma individual y colectiva, representaciones positivas de sí mismos, incorporando sus características, motivaciones, intereses y capacidades, considerando las experiencias de cambio asociadas a la pubertad y adolescencia."],
["OR08 OA 02","Analizar, considerando sus experiencias e inquietudes, la importancia que tiene para el desarrollo personal la integración de las distintas dimensiones de la sexualidad, el cuidado del cuerpo y la intimidad, discriminando formas de relacionarse en un marco de respeto y el uso de fuentes de información apropiadas para su desarrollo personal."],
["OR08 OA 03","Identificar situaciones que puedan exponer a las y los adolescentes al consumo de sustancias nocivas para el organismo, conductas sexuales riesgosas, conductas violentas, entre otras problemáticas; reconociendo la importancia de desarrollar estrategias para enfrentarlas, y contar con recursos tales como: la comunicación asertiva y la ayuda de personas significativas y/o especializadas, dentro o fuera del establecimiento."],
["OR08 OA 04","Integrar a su vida cotidiana acciones que favorezcan el bienestar y la vida saludable en el plano personal y en la comunidad escolar, optando por una alimentación saludable, un descanso apropiado, realizando actividad física o practicando deporte, resguardando la intimidad e integridad del cuerpo, incorporando medidas de seguridad en el uso de redes sociales, entre otros."],
["OR08 OA 05","Analizar sus relaciones, presenciales o virtuales a través de las redes sociales, y las de su entorno inmediato atendiendo a los derechos de las personas involucradas considerando los principios de igualdad, dignidad, inclusión y no discriminación, identificando circunstancias en las que no se ha actuado conforme a estos derechos, y reconociendo el impacto en el bienestar de quienes se vean involucrados."],
["OR08 OA 06","Resolver conflictos y desacuerdos a través del diálogo, la escucha empática y la búsqueda de soluciones en forma respetuosa y sin violencia, reconociendo que el conflicto es una oportunidad de aprendizaje y desarrollo inherente a las relaciones humanas."],
["OR08 OA 07","Reconocer intereses, inquietudes, problemas o necesidades compartidas con su grupo de pertenencia, ya sea dentro del curso u otros espacios de participación, y colaborar para alcanzar metas comunes valorando el trabajo en equipo y los aportes de cada uno de sus miembros."],
["OR08 OA 08","Elaborar acuerdos orientados al logro de fines compartidos por el curso, utilizando para esto los espacios de participación disponibles, como Consejo de Curso, asambleas, encuentros u otros, contribuyendo democráticamente a través del diálogo, el debate y el reconocimiento de representantes democráticamente electos; respetando la diversidad de opiniones y el derecho de hombres y mujeres."],
["OR08 OA 09","Reconocer sus intereses, motivaciones, necesidades y capacidades, comprendiendo la relevancia del aprendizaje escolar sistemático para la exploración y desarrollo de estos, así como para la elaboración de sus proyectos personales."],
["OR08 OA 10","Gestionar de manera autónoma su propio proceso de aprendizaje escolar, a través del establecimiento de metas progresivas de aprendizaje, la definición de líneas de acción para lograrlas, el monitoreo de logros y la redefinición de acciones que resulten necesarias."]
];

const english8=[
["IN08 OA 01","Demostrar comprensión de ideas generales e información explícita en textos orales adaptados y auténticos simples, literarios y no literarios, en diversos formatos audiovisuales (como exposiciones orales, conversaciones, entrevistas, descripciones, instrucciones, procedimientos, anécdotas, narraciones, rimas, juegos de palabras y canciones), acerca de temas variados (experiencias personales, temas de otras asignaturas, del contexto inmediato, de actualidad e interés global o de otras culturas) y que contienen las funciones del año."],
["IN08 OA 02","Identificar palabras y frases clave, expresiones de uso frecuente, vocabulario temático, conectores (then, also, so, until y los del año anterior), sonidos /ð/ y /θ/ (this, mother/three, birthday), sonidos iniciales /w/ (week), /r/ (ready) y los sonidos finales /d/, /t/ o /Id/ (lived/helped/decided) de verbos regulares en pasado, en textos orales en diversos formatos o al participar en interacciones cotidianas y conversaciones en la clase."],
["IN08 OA 03","Identificar en los textos escuchados: propósito o finalidad del texto, tema e ideas generales; información específica y detalles relevantes asociados a personas y sus acciones, lugares, tiempo, hablantes y situaciones; pasos en instrucciones y procedimientos, secuencia de eventos, diferencia entre hecho y opinión y relaciones causa-efecto y condición."],
["IN08 OA 04","Identificar y usar estrategias para apoyar la comprensión de los textos escuchados: hacer predicciones; escuchar con un propósito; usar conocimientos previos; focalizar la atención en palabras y/o expresiones clave; utilizar apoyos como imágenes y gestos del hablante; preguntar para clarificar o corroborar información en interacciones; confirmar predicciones; resumir alguna idea con apoyo."],
["IN08 OA 05","Presentar información en forma oral, usando recursos multimodales que refuercen el mensaje en forma creativa acerca de temas variados (como experiencias personales, temas de otras asignaturas, otras culturas, problemas globales y textos leídos o escuchados), demostrando: conocimiento del contenido y coherencia en la organización de ideas; uso apropiado de las funciones del lenguaje y vocabulario del nivel; uso apropiado de sonidos del idioma como /ð/ y /θ/ (this, mother/three, birthday), sonidos iniciales /w/ (week), /r/ (ready) y los sonidos finales /d/, /t/ o /Id/ (lived/helped/decided), de verbos regulares en pasado; tener conciencia de audiencia, contexto y propósito."],
["IN08 OA 06","Participar en interacciones y exposiciones recurriendo a las siguientes estrategias para expresarse con claridad y fluidez: antes de hablar: practicar presentación, repetir, predecir vocabulario clave y expresiones de uso común (chunks), preparar apoyo organizacional y visual; al hablar: usar gestos y rellenos temporales (por ejemplo: you know...; sure!), parafrasear y usar sinónimos, activar uso de conectores, solicitar ayuda; después de hablar: registrar errores y corregirlos con ayuda del docente y recursos."],
["IN08 OA 07","Reaccionar a textos leídos o escuchados por medio de exposiciones orales o en discusiones y conversaciones grupales, en las que: hacen conexiones con otras asignaturas, la lengua materna y su cultura, la vida cotidiana, experiencias personales y otras culturas con apoyo; por ejemplo: I know (about) this because...; I remember that...; expresan opiniones, hacen comparaciones y las justifican; por ejemplo: there will be...because...; you should/shouldn't...because...; I know/find..., I think there will...; .... is more important than...; ...is the oldest ... because...; resumen y sintetizan información, usando oraciones simples y descripciones breves y simples; generan preguntas con apoyo; por ejemplo: Whose ...are these?, How much taller is ...? When...?."],
["IN08 OA 08","Demostrar conocimiento y uso del lenguaje en conversaciones, discusiones y exposiciones por medio de las siguientes funciones: expresar cantidades, contar y enumerar; por ejemplo: there are a lot of people; all the/plenty of/several people; she is the first/third; two hundred and fifty; expresar gustos y preferencias; por ejemplo: I love/enjoy/hate/don't mind playing the piano; I'd/would like...; comparar; por ejemplo: he is taller than Tom; this supermarket is the cheapest/most expensive in the city; solicitar y dar información sobre tiempo; por ejemplo: When is the party? On Saturday, at 10:00 o'clock/tomorrow/next week/year; in December; expresar intenciones, planes futuros y predicciones; por ejemplo: I'm going to Easter Island next week; she's arriving tomorrow morning; Man will land on Mars in the year 2500/in the future; identificar y describir objetos, lugares y personas; por ejemplo: it's a big brown building; they are French; the man in...; the woman with...; expresar dirección; por ejemplo: into the bank; out of the store; from the supermarket; to school; expresarse con claridad, usando palabras y expresiones de uso común, sinónimos y palabras compuestas; por ejemplo: I like/love swimming; arrive at the station; look at; that's OK; catch a bus/coach/train; get on/off the bus; let's...; go on holidays; tired of; maybe, download; señalar frecuencia y secuencia de acciones; por ejemplo: I never/always/sometimes visit the country; first..., next..., then..., last, finally; solicitar permiso y dar consejo; por ejemplo: Can I go out?; You shouldn't walk in the rain without an umbrella; unir ideas; por ejemplo: he came and then we watched the film; it was far so we took the bus; I'll wait until Monday; the library is the best in town. It also has...; solicitar y dar información sobre posesión; por ejemplo: Whose wallet is this? It belongs to a friend of mine/his; It's hers/theirs; Which is yours?; expresar condiciones; por ejemplo: If you cook, I'll help you."],
["IN08 OA 09","Demostrar comprensión de ideas generales e información explícita en textos adaptados y auténticos simples, en formato impreso o digital, acerca de temas variados (como experiencias personales, temas de otras asignaturas, del contexto inmediato, de actualidad e interés global o de otras culturas) y que contienen las funciones del año."],
["IN08 OA 10","Demostrar comprensión de textos no literarios (como descripciones, artículos de revista, instrucciones, procedimientos, avisos publicitarios, emails, diálogos, páginas web, biografías, gráficos) al identificar: propósito o finalidad del texto; ideas generales, información específica y detalles; relaciones de secuencia, causa-efecto y condición entre ideas y diferencia hecho-opinión; palabras y frases clave, expresiones de uso frecuente y vocabulario temático; conectores (so, then, until, also, maybe y los del año anterior) y palabras derivadas de otras por medio de los sufijos -er en comparaciones y terminación -ion."],
["IN08 OA 11","Demostrar comprensión de textos literarios (como canciones o poemas, tiras cómicas, cuentos breves y simples y novelas adaptadas) al identificar: el tema como idea general, personajes, sus acciones y características, entorno (tiempo, lugar), trama (inicio, desarrollo, final), problema-solución; palabras y frases clave, expresiones de uso frecuente y vocabulario temático."],
["IN08 OA 12","Identificar y usar estrategias para apoyar la comprensión de los textos leídos: prelectura: leer con un propósito, hacer predicciones, usar conocimientos previos; lectura: hacer lectura rápida y lectura focalizada, visualizar, identificar elementos organizacionales del texto (título, subtítulo, imágenes); poslectura: confirmar predicciones, usar organizadores gráficos, releer, recontar con apoyo, preguntar para confirmar información."],
["IN08 OA 13","Escribir historias e información relevante, usando diversos recursos multimodales que refuercen el mensaje en forma creativa en textos variados acerca de temas como: experiencias personales; contenidos interdisciplinarios; problemas globales; cultura de otros países; textos leídos."],
["IN08 OA 14","Escribir una variedad de textos breves, como cuentos, correos electrónicos, folletos, rimas, descripciones, biografías, instrucciones y resúmenes utilizando los pasos del proceso de escritura (organizar ideas, redactar, revisar, editar, publicar), ocasionalmente con apoyo de acuerdo a un modelo y a un criterio de evaluación, recurriendo a herramientas como el procesador de textos y diccionarios en línea."],
["IN08 OA 15","Escribir para informar, expresar opiniones y narrar, usando: palabras, oraciones y estructuras aprendidas y otras de uso frecuente; conectores aprendidos; correcta ortografía de mayoría de palabras aprendidas de uso muy frecuente; puntuación apropiada (dos puntos)."],
["IN08 OA 16","Demostrar conocimiento y uso del lenguaje en sus textos escritos por medio de las siguientes funciones: expresar cantidades, contar y enumerar; por ejemplo: there are a lot of people; all the/several people; she is the first/third; two hundred and fifty; expresar gustos, preferencias y opiniones; por ejemplo: I love/enjoy/hate/don't mind playing the piano; I'd/would like...I know...; I find...; comparar; por ejemplo: he is taller than Tom; this supermarket is the best/most expensive in the city; solicitar y dar información sobre tiempo; por ejemplo: When is the party? On Saturday, at 10:00 o'clock/tomorrow/next week/year; in December; expresar intenciones, planes futuros y predicciones; por ejemplo: I'm going to Easter Island next week; she's arriving tomorrow morning; Man will land on Mars in the year 2500/in the future; identificar y describir objetos, lugares y personas; por ejemplo: it's a big brown building; they are French; the man in...; the woman with...; the location/accommodation/destination was great; expresar tiempo, y dirección; por ejemplo: on Monday; in December; at 5 o'clock, into the bank; out of the store; from the supermarket; to school; expresarse con claridad, usando palabras y expresiones de uso común, sinónimos y palabras compuestas; por ejemplo: I like/love swimming; arrive at the station; look at; get on/off the bus; let's...; go on holidays; download; señalar frecuencia y secuencia de acciones; por ejemplo: I never/always/sometimes visit the country; first..., next..., then...; unir ideas; por ejemplo: he came and then we watched the film; it was far so we took the bus; I'll wait until Monday; the library is the best in town. It also has...; expresar condiciones; por ejemplo: If you cook, I'll help you."]
];

async function syncBlock({level,subject,objectives,expected,sourceUrl}){
 if(objectives.length!==expected) throw new Error(`OA catalog mismatch for ${subject} ${level}: expected ${expected}, got ${objectives.length}`);
 const codes=objectives.map(([code])=>code);
 const duplicateCodes=codes.filter((code,index)=>codes.indexOf(code)!==index);
 if(duplicateCodes.length) throw new Error(`Duplicate OA codes for ${subject} ${level}: ${[...new Set(duplicateCodes)].join(", ")}`);
 if(objectives.some(([code,text])=>!String(code).trim()||!String(text).trim())) throw new Error(`Empty OA code/text for ${subject} ${level}`);
 let created=0,updated=0;
 for(const [code,text] of objectives){
  const rows=await prisma.learningObjective.findMany({where:{code,level,subject},orderBy:{id:"asc"}});
  if(rows.length){
   const isPlaceholder=(value)=>{const s=String(value||"");return s.startsWith("Referencia curricular oficial ")||s.includes("Consultar descripción oficial MINEDUC")||/· Objetivo \\d{2}\\.?$/.test(s)};
   const incomingGeneric=isPlaceholder(text);
   const existingGeneric=isPlaceholder(rows[0].text);
   const data=(!incomingGeneric||existingGeneric)?{text,source,sourceUrl}:{source,sourceUrl};
   await prisma.learningObjective.update({where:{id:rows[0].id},data});
   if(rows.length>1) await prisma.learningObjective.deleteMany({where:{id:{in:rows.slice(1).map(x=>x.id)}}});
   updated++;
  }else{await prisma.learningObjective.create({data:{code,text,level,subject,source,sourceUrl}});created++;}
 }
 return {created,updated};
}
const pad2=n=>String(n).padStart(2,"0");
const referenceObjectives=(prefix,count)=>Array.from({length:count},(_,i)=>{const code=prefix+" OA "+pad2(i+1);return [code,"Referencia curricular oficial "+code+". Consultar Currículum Nacional · MINEDUC."];});
const courseUrl=(slug,n)=>sourceUrl1to6+"/"+slug+"/"+n+"-basico";
const blocks=[
 {level:"4° Medio HC",subject:"Química",expected:7,sourceUrl:sourceUrl3to4m+"/quimica/4-medio-hc",objectives:[["CN-QUIM-3y4-OAC-01","Nanoquímica y polímeros: desarrollo, aplicaciones y consecuencias."],["CN-QUIM-3y4-OAC-02","Fenómenos ácido-base, redox y polimerización en sistemas naturales y tecnológicos."],["CN-QUIM-3y4-OAC-03","Termodinámica y cinética química aplicadas a sistemas naturales."],["CN-QUIM-3y4-OAC-04","Cambio climático, ciclos biogeoquímicos y equilibrios químicos."],["CN-QUIM-3y4-OAC-05","Contaminantes químicos: origen, exposición, efectos y propiedades."],["CN-QUIM-3y4-OAC-06","Aportes de la química para prevenir y mitigar efectos del cambio climático."],["CN-QUIM-3y4-OAC-07","Integración de química y otras ciencias para abordar problemas actuales."]]},
 {level:"3° Medio HC",subject:"Química",expected:7,sourceUrl:sourceUrl3to4m+"/quimica/3-medio-hc",objectives:[["CN-QUIM-3y4-OAC-01","Nanoquímica y polímeros: desarrollo, aplicaciones y consecuencias."],["CN-QUIM-3y4-OAC-02","Fenómenos ácido-base, redox y polimerización en sistemas naturales y tecnológicos."],["CN-QUIM-3y4-OAC-03","Termodinámica y cinética química aplicadas a sistemas naturales."],["CN-QUIM-3y4-OAC-04","Cambio climático, ciclos biogeoquímicos y equilibrios químicos."],["CN-QUIM-3y4-OAC-05","Contaminantes químicos: origen, exposición, efectos y propiedades."],["CN-QUIM-3y4-OAC-06","Aportes de la química para prevenir y mitigar efectos del cambio climático."],["CN-QUIM-3y4-OAC-07","Integración de química y otras ciencias para abordar problemas actuales."]]},
 {level:"3° Medio HC",subject:"Geometría 3D",expected:5,sourceUrl:sourceUrl3to4m+"/geometria-3d/3-medio-hc",objectives:[["MA-GE3D-3y4-OAC-01","Isometrías y homotecias mediante vectores y representaciones digitales."],["MA-GE3D-3y4-OAC-02","Puntos, rectas y planos en el espacio tridimensional mediante vectores."],["MA-GE3D-3y4-OAC-03","Relaciones entre figuras 3D y 2D mediante vistas, cortes y proyecciones."],["MA-GE3D-3y4-OAC-04","Área y volumen de figuras 3D generadas por rotación o traslación."],["MA-GE3D-3y4-OAC-05","Perspectiva, proyección y puntos de fuga aplicados al diseño."]]},
 {level:"4° Medio HC",subject:"Geometría 3D",expected:5,sourceUrl:sourceUrl3to4m+"/geometria-3d/4-medio-hc",objectives:[["MA-GE3D-3y4-OAC-01","Isometrías y homotecias mediante vectores y representaciones digitales."],["MA-GE3D-3y4-OAC-02","Puntos, rectas y planos en el espacio tridimensional mediante vectores."],["MA-GE3D-3y4-OAC-03","Relaciones entre figuras 3D y 2D mediante vistas, cortes y proyecciones."],["MA-GE3D-3y4-OAC-04","Área y volumen de figuras 3D generadas por rotación o traslación."],["MA-GE3D-3y4-OAC-05","Perspectiva, proyección y puntos de fuga aplicados al diseño."]]},
 ...oa34,
 ...oa56,
 ...oaLCPO,
 ...oa7,
 ...oa12m,
 ...oa34mHC,
 ...oa34mHCSciences,
 ...oa34mHCVerifiedExtra,...oa34mHCMathLanguage,...oa34mHCHistoryPhilosophy,...oa34mHCPhilosophyExtra,...oa34mHCGeneralElectives,
 {level:"1° Básico",subject:"Matemática",expected:20,objectives:[
["MA01 OA 01","Conteo de números hasta 100 en distintas secuencias."],
["MA01 OA 02","Uso de números ordinales del 1.º al 10.º."],
["MA01 OA 03","Lectura y representación de números hasta 20."],
["MA01 OA 04","Comparación y orden de números hasta 20."],
["MA01 OA 05","Estimación de cantidades hasta 20."],
["MA01 OA 06","Composición y descomposición aditiva hasta 20."],
["MA01 OA 07","Estrategias de cálculo mental para sumar y restar hasta 20."],
["MA01 OA 08","Identificación de unidades y decenas hasta 20."],
["MA01 OA 09","Comprensión y resolución de adiciones y sustracciones hasta 20."],
["MA01 OA 10","Relación inversa entre adición y sustracción."],
["MA01 OA 11","Creación y continuación de patrones repetitivos y numéricos."],
["MA01 OA 12","Igualdad y desigualdad como equilibrio y desequilibrio."],
["MA01 OA 13","Posición espacial de objetos y personas."],
["MA01 OA 14","Identificación y relación de figuras 2D y 3D."],
["MA01 OA 15","Identificación y dibujo de líneas rectas y curvas."],
["MA01 OA 16","Comparación de duración usando unidades no estandarizadas."],
["MA01 OA 17","Secuenciación temporal de días, meses y fechas significativas."],
["MA01 OA 18","Comparación de longitudes usando largo y corto."],
["MA01 OA 19","Recolección y registro de datos en tablas y pictogramas."],
["MA01 OA 20","Construcción, lectura e interpretación de pictogramas."]
],sourceUrl:courseUrl("matematica",1)},
 {level:"1° Básico",subject:"Lenguaje y Comunicación",expected:26,objectives:[
["LE01 OA 01","Propósito y autoría de los textos escritos."],
["LE01 OA 02","Palabras como unidades de significado separadas por espacios."],
["LE01 OA 03","Conciencia fonológica: fonemas y sílabas."],
["LE01 OA 04","Lectura de palabras mediante correspondencia letra-sonido."],
["LE01 OA 05","Lectura oral de textos breves con fluidez inicial."],
["LE01 OA 06","Estrategias básicas de comprensión lectora."],
["LE01 OA 07","Lectura autónoma de diversos textos literarios."],
["LE01 OA 08","Comprensión de narraciones familiares."],
["LE01 OA 09","Lectura y disfrute habitual de poemas."],
["LE01 OA 10","Comprensión de textos no literarios simples."],
["LE01 OA 11","Exploración de libros para desarrollar gusto lector."],
["LE01 OA 12","Uso habitual de la biblioteca y elección de textos."],
["LE01 OA 13","Escritura para comunicar hechos, ideas y sentimientos."],
["LE01 OA 14","Escritura de oraciones completas con intención comunicativa."],
["LE01 OA 15","Escritura legible con adecuada separación de palabras."],
["LE01 OA 16","Uso pertinente de vocabulario nuevo en la escritura."],
["LE01 OA 17","Comprensión y disfrute de literatura escuchada."],
["LE01 OA 18","Comprensión de textos orales y formulación de opiniones."],
["LE01 OA 19","Curiosidad por palabras desconocidas y su significado."],
["LE01 OA 20","Disfrute de obras teatrales y representaciones infantiles."],
["LE01 OA 21","Participación respetuosa en conversaciones grupales."],
["LE01 OA 22","Interacción según convenciones sociales y fórmulas de cortesía."],
["LE01 OA 23","Expresión oral coherente y articulada sobre temas de interés."],
["LE01 OA 24","Uso de vocabulario nuevo en intervenciones orales."],
["LE01 OA 25","Desempeño de roles para lenguaje, autoestima y colaboración."],
["LE01 OA 26","Recitación expresiva de poemas, rimas, canciones y adivinanzas."]
],sourceUrl:courseUrl("lenguaje-comunicacion",1)},
 {level:"1° Básico",subject:"Historia, Geografía y Ciencias Sociales",expected:15,objectives:[
["HI01 OA 01","Secuenciar acontecimientos y actividades de la vida cotidiana."],
["HI01 OA 02","Aplicar conceptos temporales como antes, después, ayer, hoy y mañana."],
["HI01 OA 03","Registrar información sobre elementos que forman parte de su identidad personal."],
["HI01 OA 04","Obtener y comunicar información sobre su entorno familiar."],
["HI01 OA 05","Reconocer símbolos representativos de Chile."],
["HI01 OA 06","Conocer expresiones culturales locales y nacionales."],
["HI01 OA 07","Conocer modos de vida de niños y niñas en otras partes del mundo."],
["HI01 OA 08","Reconocer acciones que muestran respeto y buena convivencia."],
["HI01 OA 09","Explicar y aplicar normas de convivencia y seguridad."],
["HI01 OA 10","Observar y describir paisajes de su entorno local."],
["HI01 OA 11","Reconocer que los mapas y planos representan lugares."],
["HI01 OA 12","Identificar Chile en mapas y reconocer su ubicación relativa."],
["HI01 OA 13","Reconocer características del paisaje natural y cultural."],
["HI01 OA 14","Identificar trabajos y actividades de personas de la comunidad."],
["HI01 OA 15","Valorar el trabajo y los aportes de distintas personas a la comunidad."]
],sourceUrl:courseUrl("historia-geografia-ciencias-sociales",1)},
 {level:"1° Básico",subject:"Artes Visuales",expected:5,objectives:[
["AR01 OA 01","Expresar ideas y emociones mediante creación visual basada en observación y experiencias."],
["AR01 OA 02","Experimentar con materiales, herramientas y procedimientos de expresión visual."],
["AR01 OA 03","Expresar ideas personales mediante dibujo, pintura, escultura y técnicas mixtas."],
["AR01 OA 04","Observar y comunicar impresiones sobre obras de arte y entorno visual."],
["AR01 OA 05","Explicar preferencias frente a trabajos propios, de pares y obras observadas."]
],sourceUrl:courseUrl("artes-visuales",1)},
 {level:"1° Básico",subject:"Música",expected:7,objectives:[
["MU01 OA 01","Escuchar cualidades del sonido y elementos musicales presentes en el entorno."],
["MU01 OA 02","Expresar sensaciones e ideas que provoca la música mediante distintos lenguajes."],
["MU01 OA 03","Escuchar música diversa y ampliar experiencias musicales."],
["MU01 OA 04","Cantar al unísono y tocar instrumentos de percusión convencionales y no convencionales."],
["MU01 OA 05","Explorar e improvisar ideas musicales con voz, cuerpo e instrumentos."],
["MU01 OA 06","Presentar el trabajo musical realizado individual y colectivamente."],
["MU01 OA 07","Identificar y describir experiencias musicales de su vida cotidiana."]
],sourceUrl:courseUrl("musica",1)},
 {level:"1° Básico",subject:"Educación Física y Salud",expected:11,objectives:[
["EF01 OA 01","Demostrar habilidades motrices básicas de locomoción, manipulación y estabilidad."],
["EF01 OA 02","Ejecutar acciones motrices en relación con espacio, tiempo y objetos."],
["EF01 OA 03","Practicar juegos y actividades físicas respetando instrucciones y reglas."],
["EF01 OA 04","Ejecutar actividad física de intensidad moderada a vigorosa mediante juegos."],
["EF01 OA 05","Reconocer respuestas corporales asociadas al ejercicio físico."],
["EF01 OA 06","Practicar actividades físicas demostrando seguridad y autocuidado."],
["EF01 OA 07","Practicar hábitos de higiene, hidratación y vida saludable vinculados a actividad física."],
["EF01 OA 08","Participar en juegos colaborativos respetando a compañeros y compañeras."],
["EF01 OA 09","Ejecutar movimientos corporales expresivos en diferentes ritmos y situaciones."],
["EF01 OA 10","Realizar actividad física en distintos entornos de manera segura."],
["EF01 OA 11","Reconocer y aplicar conductas de juego limpio y convivencia durante actividad física."]
],sourceUrl:courseUrl("educacion-fisica-salud",1)},
 {level:"1° Básico",subject:"Tecnología",expected:7,objectives:[
["TE01 OA 01","Crear diseños de objetos tecnológicos simples a partir de necesidades cotidianas."],
["TE01 OA 02","Distinguir tareas y acciones necesarias para elaborar un objeto tecnológico."],
["TE01 OA 03","Elaborar objetos tecnológicos usando materiales y herramientas de forma segura."],
["TE01 OA 04","Probar y explicar resultados del objeto tecnológico elaborado."],
["TE01 OA 05","Usar software de dibujo para comunicar ideas y diseños."],
["TE01 OA 06","Explorar funciones básicas de herramientas digitales para crear y organizar información."],
["TE01 OA 07","Reconocer medidas de cuidado y seguridad al utilizar tecnologías."]
],sourceUrl:courseUrl("tecnologia",1)},
 {level:"1° Básico",subject:"Orientación",expected:8,objectives:[
["OR01 OA 01","Observar y describir características personales, habilidades e intereses."],
["OR01 OA 02","Identificar emociones propias y de otras personas en situaciones cotidianas."],
["OR01 OA 03","Reconocer y valorar la pertenencia a familia, curso y comunidad."],
["OR01 OA 04","Practicar conductas de respeto, buen trato y colaboración."],
["OR01 OA 05","Identificar situaciones de riesgo y formas de pedir ayuda."],
["OR01 OA 06","Reconocer hábitos que favorecen el autocuidado y bienestar."],
["OR01 OA 07","Participar responsablemente en actividades del curso y la escuela."],
["OR01 OA 08","Reconocer la importancia de aprender, esforzarse y cumplir responsabilidades."]
],sourceUrl:courseUrl("orientacion",1)},
 {level:"2° Básico",subject:"Matemática",expected:22,objectives:[
["MA02 OA 01","Conteo ascendente y descendente hasta 1.000 en secuencias de 2, 5, 10 y 100."],
["MA02 OA 02","Lectura y representación concreta, pictórica y simbólica de números del 0 al 100."],
["MA02 OA 03","Comparación y orden de números del 0 al 100, usando representaciones y monedas."],
["MA02 OA 04","Estimación de cantidades hasta 100 usando referentes."],
["MA02 OA 05","Composición y descomposición aditiva de números del 0 al 100."],
["MA02 OA 06","Estrategias de cálculo mental para adiciones y sustracciones hasta 20."],
["MA02 OA 07","Valor posicional de unidades y decenas en números del 0 al 100."],
["MA02 OA 08","Efecto de sumar o restar cero a un número mediante representaciones."],
["MA02 OA 09","Adición y sustracción hasta 100 mediante representaciones, algoritmos y resolución de problemas."],
["MA02 OA 10","Relación inversa entre adición y sustracción mediante familias de operaciones."],
["MA02 OA 11","Comprensión de la multiplicación como suma reiterada y tablas del 2, 5 y 10."],
["MA02 OA 12","Creación, representación y continuación de patrones numéricos."],
["MA02 OA 13","Igualdad y desigualdad del 0 al 20 usando =, > y <."],
["MA02 OA 14","Posición de objetos y personas, incluyendo derecha e izquierda."],
["MA02 OA 15","Descripción, comparación y construcción de figuras 2D."],
["MA02 OA 16","Descripción, comparación y construcción de figuras 3D."],
["MA02 OA 17","Uso del calendario para identificar días, semanas, meses y fechas."],
["MA02 OA 18","Lectura de horas y medias horas en relojes digitales para resolver problemas."],
["MA02 OA 19","Medición de longitudes con unidades no estandarizadas, centímetros y metros."],
["MA02 OA 20","Recolección y registro de datos de juegos aleatorios mediante tablas y pictogramas."],
["MA02 OA 21","Registro de resultados de juegos aleatorios en tablas y gráficos de barra simple."],
["MA02 OA 22","Construcción, lectura e interpretación de pictogramas con escala y gráficos de barra simple."]
],sourceUrl:courseUrl("matematica",2)},
 {level:"2° Básico",subject:"Lenguaje y Comunicación",expected:30,objectives:[
["LE02 OA 01","Lectura de palabras con hiatos, diptongos, grupos consonánticos y combinaciones ortográficas frecuentes."],
["LE02 OA 02","Lectura en voz alta con precisión, fluidez y respeto de la puntuación."],
["LE02 OA 03","Aplicación de estrategias de comprensión: conectar experiencias, visualizar y formular preguntas."],
["LE02 OA 04","Lectura autónoma de literatura diversa para ampliar conocimiento e imaginación."],
["LE02 OA 05","Comprensión de narraciones mediante información explícita e implícita, secuencias, personajes, ambiente y opiniones."],
["LE02 OA 06","Lectura y comprensión de poemas, identificando imágenes, comparaciones y sentido global."],
["LE02 OA 07","Lectura independiente y comprensión de textos no literarios para aprender sobre el mundo."],
["LE02 OA 08","Desarrollo del gusto por la lectura mediante lectura habitual de diversos textos."],
["LE02 OA 09","Uso habitual de la biblioteca para buscar información y escoger libros cuidando el material."],
["LE02 OA 10","Búsqueda de información sobre un tema en una fuente proporcionada para realizar una investigación."],
["LE02 OA 11","Curiosidad por palabras y expresiones desconocidas y hábito de averiguar su significado."],
["LE02 OA 12","Escritura frecuente de textos creativos y personales como poemas, diarios, cartas y recados."],
["LE02 OA 13","Escritura de narraciones de experiencias personales o hechos relevantes con secuencia clara."],
["LE02 OA 14","Escritura de artículos informativos para comunicar información sobre un tema."],
["LE02 OA 15","Escritura con letra clara, separando palabras adecuadamente para facilitar la lectura."],
["LE02 OA 16","Planificación de la escritura mediante generación y organización de ideas según propósito."],
["LE02 OA 17","Revisión y edición de textos para mejorar claridad, vocabulario, concordancia, ortografía y presentación."],
["LE02 OA 18","Uso de vocabulario nuevo adquirido a partir de textos escuchados o leídos."],
["LE02 OA 19","Comprensión de la función de artículos, sustantivos y adjetivos en textos orales y escritos."],
["LE02 OA 20","Identificación de género y número para mantener concordancia en la escritura."],
["LE02 OA 21","Uso correcto de combinaciones ortográficas, mayúsculas, punto y signos de interrogación y exclamación."],
["LE02 OA 22","Comprensión y disfrute de obras literarias completas narradas o leídas por un adulto."],
["LE02 OA 23","Comprensión de textos orales para obtener información, relacionarla con experiencias y formular opiniones."],
["LE02 OA 24","Disfrute de obras de teatro infantiles y representaciones para ampliar expresión y creatividad."],
["LE02 OA 25","Participación activa en conversaciones grupales respetando turnos, tema e ideas de otros."],
["LE02 OA 26","Interacción de acuerdo con convenciones sociales en distintas situaciones comunicativas."],
["LE02 OA 27","Expresión oral coherente y articulada sobre temas de interés, con vocabulario y pronunciación adecuados."],
["LE02 OA 28","Incorporación pertinente de vocabulario nuevo en intervenciones orales."],
["LE02 OA 29","Desempeño de distintos roles para desarrollar lenguaje, autoestima y trabajo en equipo."],
["LE02 OA 30","Recitación expresiva de poemas, rimas, canciones, trabalenguas y adivinanzas."]
],sourceUrl:courseUrl("lenguaje-comunicacion",2)},
 {level:"2° Básico",subject:"Ciencias Naturales",expected:14,objectives:[
["CN02 OA 01","Clasificación de vertebrados según características corporales y estructuras vitales."],
["CN02 OA 02","Exploración y clasificación de animales invertebrados y comparación con vertebrados."],
["CN02 OA 03","Comparación de etapas del ciclo de vida de distintos animales y relación con su hábitat."],
["CN02 OA 04","Comparación de hábitats según luminosidad, humedad y temperatura necesarias para los animales."],
["CN02 OA 05","Identificación de animales nativos en peligro y propuestas para protegerlos y conservar sus hábitats."],
["CN02 OA 06","Identificación y comunicación de efectos de la actividad humana sobre animales y sus hábitats."],
["CN02 OA 07","Identificación de ubicación y función de órganos esenciales del cuerpo humano."],
["CN02 OA 08","Importancia de la actividad física para músculos, corazón y bienestar general."],
["CN02 OA 09","Propiedades del agua y sus cambios frente a variaciones de temperatura."],
["CN02 OA 10","Comparación experimental de los estados sólido, líquido y gaseoso del agua."],
["CN02 OA 11","Descripción del ciclo del agua y acciones cotidianas para cuidar este recurso."],
["CN02 OA 12","Características del tiempo atmosférico y sus cambios durante el año."],
["CN02 OA 13","Medición del tiempo atmosférico mediante instrumentos como termómetro, pluviómetro o veleta."],
["CN02 OA 14","Relación entre cambios del tiempo atmosférico, estaciones del año, seres vivos y ambiente."]
],sourceUrl:courseUrl("ciencias-naturales",2)},
 {level:"2° Básico",subject:"Historia, Geografía y Ciencias Sociales",expected:16,objectives:[
["HI02 OA 01","Modos de vida de pueblos originarios de Chile precolombino considerando territorio, vivienda, actividades y cultura."],
["HI02 OA 02","Comparación entre pueblos indígenas actuales y precolombinos, reconociendo continuidades y cambios culturales."],
["HI02 OA 03","Aportes de pueblos originarios y españoles a la sociedad chilena y reconocimiento de su carácter mestizo."],
["HI02 OA 04","Aportes de inmigrantes de distintos orígenes a la diversidad histórica y cultural de Chile."],
["HI02 OA 05","Reconocimiento de expresiones del patrimonio cultural nacional y regional."],
["HI02 OA 06","Lectura y elaboración de planos simples usando referencias, posiciones relativas y símbolos."],
["HI02 OA 07","Ubicación de Chile, Santiago, región propia y países vecinos usando mapas, globo y puntos cardinales."],
["HI02 OA 08","Clasificación de paisajes de las zonas norte, centro y sur mediante vocabulario geográfico."],
["HI02 OA 09","Reconocimiento y valoración del patrimonio natural de Chile y de su región."],
["HI02 OA 10","Identificación de formas en que las personas se adaptan y transforman el entorno geográfico."],
["HI02 OA 11","Relación entre instituciones y servicios de la comunidad y las necesidades que satisfacen."],
["HI02 OA 12","Práctica de respeto, responsabilidad, tolerancia y empatía en familia, escuela y comunidad."],
["HI02 OA 13","Mantención de conductas honestas en la vida cotidiana y reconocimiento de su importancia."],
["HI02 OA 14","Conocimiento y práctica de normas de seguridad y autocuidado en espacios públicos y medios de transporte."],
["HI02 OA 15","Identificación de trabajos y actividades productivas de la comunidad y valoración de quienes los realizan."],
["HI02 OA 16","Práctica de acciones para cuidar espacios públicos, patrimonio y medioambiente de la comunidad."]
],sourceUrl:courseUrl("historia-geografia-ciencias-sociales",2)},
 {level:"2° Básico",subject:"Artes Visuales",expected:5,objectives:[
["AR02 OA 01","Creación de trabajos de arte a partir de observación del entorno natural, cultural y artístico."],
["AR02 OA 02","Experimentación y expresión visual con elementos del lenguaje visual como línea, color y forma."],
["AR02 OA 03","Expresión de emociones e ideas mediante materiales de dibujo, pintura, escultura y técnicas mixtas."],
["AR02 OA 04","Comunicación de impresiones y emociones frente a obras de arte, objetos y manifestaciones visuales."],
["AR02 OA 05","Explicación de fortalezas y aspectos a mejorar en trabajos propios y de pares usando criterios visuales."]
],sourceUrl:courseUrl("artes-visuales",2)},
 {level:"2° Básico",subject:"Música",expected:7,objectives:[
["MU02 OA 01","Escucha de cualidades del sonido y elementos musicales presentes en el entorno y repertorio."],
["MU02 OA 02","Expresión de sensaciones, emociones e ideas provocadas por la música mediante diversos medios."],
["MU02 OA 03","Escucha de música de distintos contextos, culturas y estilos ampliando experiencias musicales."],
["MU02 OA 04","Canto al unísono y ejecución de instrumentos de percusión convencionales y no convencionales."],
["MU02 OA 05","Exploración e improvisación de ideas musicales con voz, cuerpo e instrumentos."],
["MU02 OA 06","Presentación del trabajo musical propio y colectivo con responsabilidad y disposición."],
["MU02 OA 07","Identificación y comunicación de experiencias, aprendizajes y preferencias musicales."]
],sourceUrl:courseUrl("musica",2)},
 {level:"2° Básico",subject:"Educación Física y Salud",expected:11,objectives:[
["EF02 OA 01","Demostración de habilidades motrices básicas de locomoción, manipulación y estabilidad en variadas situaciones."],
["EF02 OA 02","Ejecución de acciones motrices que combinan habilidades y control corporal en diferentes espacios."],
["EF02 OA 03","Práctica de juegos y actividades físicas aplicando estrategias simples y resolviendo problemas motores."],
["EF02 OA 04","Realización de actividad física de intensidad moderada a vigorosa para mejorar condición física."],
["EF02 OA 05","Aplicación de respuestas corporales y sensaciones asociadas al esfuerzo físico."],
["EF02 OA 06","Práctica regular de actividad física y reconocimiento de sus beneficios para la salud."],
["EF02 OA 07","Práctica de hábitos de higiene, postura, hidratación y alimentación vinculados con actividad física."],
["EF02 OA 08","Participación segura en juegos y actividades respetando instrucciones, espacios y materiales."],
["EF02 OA 09","Práctica de actividades físicas en distintos entornos naturales y cotidianos con seguridad."],
["EF02 OA 10","Participación en juegos colectivos demostrando respeto, cooperación, honestidad y juego limpio."],
["EF02 OA 11","Ejecución de actividades rítmicas y expresivas mediante movimientos corporales coordinados."]
],sourceUrl:courseUrl("educacion-fisica-salud",2)},
 {level:"2° Básico",subject:"Tecnología",expected:7,objectives:[
["TE02 OA 01","Creación de diseños de objetos tecnológicos para resolver problemas cotidianos representando ideas mediante dibujos o modelos."],
["TE02 OA 02","Organización de tareas y elaboración de objetos tecnológicos seleccionando materiales y herramientas apropiados."],
["TE02 OA 03","Elaboración de objetos tecnológicos usando técnicas de medir, marcar, cortar, unir, pintar y terminar."],
["TE02 OA 04","Prueba y evaluación de objetos tecnológicos considerando funcionamiento, seguridad y mejoras posibles."],
["TE02 OA 05","Uso de software de dibujo para comunicar ideas mediante imágenes y formas."],
["TE02 OA 06","Uso de procesador de texto para escribir, editar, guardar y recuperar información."],
["TE02 OA 07","Uso guiado de internet y tecnologías de comunicación respetando normas básicas de seguridad."]
],sourceUrl:courseUrl("tecnologia",2)},
 {level:"2° Básico",subject:"Orientación",expected:8,objectives:[
["OR02 OA 01","Observación y valoración de características, habilidades e intereses personales que contribuyen a la identidad."],
["OR02 OA 02","Identificación y expresión adecuada de emociones propias y de otras personas."],
["OR02 OA 03","Reconocimiento de situaciones de cuidado y respeto del cuerpo, intimidad y límites personales."],
["OR02 OA 04","Práctica de hábitos de vida saludable, autocuidado, higiene, descanso y actividad física."],
["OR02 OA 05","Manifestación de actitudes de respeto, buen trato, solidaridad y colaboración en la convivencia."],
["OR02 OA 06","Identificación y práctica de estrategias para resolver conflictos de manera pacífica y dialogada."],
["OR02 OA 07","Reconocimiento de la importancia del trabajo escolar, la responsabilidad y la organización para aprender."],
["OR02 OA 08","Participación en acciones y responsabilidades del curso que favorecen la convivencia y el bien común."]
],sourceUrl:courseUrl("orientacion",2)},
 {level:"1° Básico",subject:"Ciencias Naturales",expected:12,objectives:science1,sourceUrl:sourceUrl1to6},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Matemática",expected:17,objectives:mathematics8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Lengua y Literatura",expected:26,objectives:language8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Ciencias Naturales",expected:15,objectives:science8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Historia, Geografía y Ciencias Sociales",expected:22,objectives:history8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Artes Visuales",expected:6,objectives:arts8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Música",expected:7,objectives:music8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Educación Física y Salud",expected:5,objectives:physicalEducation8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Tecnología",expected:6,objectives:technology8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Orientación",expected:10,objectives:orientation8},
 {sourceUrl:sourceUrl7to2m,level:"8° Básico",subject:"Idioma Extranjero: Inglés",expected:16,objectives:english8}
];
async function syncTP(){const source="Currículum Nacional · MINEDUC";const sourceUrl="https://www.curriculumnacional.cl/curriculum/3o-4o-medio-tecnico-profesional";for(const block of tpPriority){const module=await prisma.curriculumModule.upsert({where:{specialty_level_name:{specialty:block.specialty,level:block.level,name:"Objetivos de Aprendizaje de la Especialidad"}},update:{active:true,source,sourceUrl},create:{code:"OA-ESPECIALIDAD",name:"Objetivos de Aprendizaje de la Especialidad",specialty:block.specialty,level:block.level,source,sourceUrl,active:true}});for(const [code,text] of block.objectives){let oa=await prisma.learningObjective.findFirst({where:{code,level:block.level,specialty:block.specialty}});if(oa)oa=await prisma.learningObjective.update({where:{id:oa.id},data:{text,source,sourceUrl,module:module.name}});else oa=await prisma.learningObjective.create({data:{code,text,level:block.level,specialty:block.specialty,module:module.name,source,sourceUrl}});await prisma.curriculumModuleObjective.upsert({where:{moduleId_objectiveId:{moduleId:module.id,objectiveId:oa.id}},update:{},create:{moduleId:module.id,objectiveId:oa.id}})}console.log(`TP OA seed: ${block.specialty} ${block.level} total=${block.objectives.length}`)}}
async function syncTPModules(){const source="Currículum Nacional · MINEDUC";const sourceUrl="https://www.curriculumnacional.cl/curriculum/3o-4o-medio-tecnico-profesional";for(const spec of tpModules.modules){const module=await prisma.curriculumModule.upsert({where:{specialty_level_name:{specialty:spec.specialty,level:spec.level,name:spec.name}},update:{code:spec.code,active:true,source,sourceUrl},create:{code:spec.code,name:spec.name,specialty:spec.specialty,level:spec.level,source,sourceUrl,active:true}});let objectives=[];if(spec.generic){for(const [code,text] of tpModules.oag){let oa=await prisma.learningObjective.findFirst({where:{code,level:spec.level,specialty:spec.specialty}});if(!oa)oa=await prisma.learningObjective.create({data:{code,text,level:spec.level,specialty:spec.specialty,module:spec.name,source,sourceUrl}});else oa=await prisma.learningObjective.update({where:{id:oa.id},data:{text,source,sourceUrl}});objectives.push(oa)}}else{for(const code of spec.oa||[]){const oa=await prisma.learningObjective.findFirst({where:{code,level:spec.level,specialty:spec.specialty}});if(!oa)throw new Error("TP module "+spec.code+" references missing objective "+code+" for "+spec.specialty+" "+spec.level);objectives.push(oa)}}for(const oa of objectives)await prisma.curriculumModuleObjective.upsert({where:{moduleId_objectiveId:{moduleId:module.id,objectiveId:oa.id}},update:{},create:{moduleId:module.id,objectiveId:oa.id}});console.log(`TP module seed: ${spec.code} ${spec.name} objectives=${objectives.length}`)}}
async function main(){
 for(const block of blocks){
  const result=await syncBlock(block);
  console.log(`Official OA seed: ${block.subject} ${block.level} created=${result.created} updated=${result.updated} total=${block.objectives.length}`);
 }
 await syncTP();
 await syncTPModules();
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
