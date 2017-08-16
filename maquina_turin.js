var t_intput = bind("t_input");			// la caja de entrada de html
var container = bind("container");		// el contenedor vacio de html
var answer = bind("answer");			// la etiqueta a lado del boton de entrada en html
var selector = bind("input");			// para abrir venta de selecion y abrir archivo
var gramatica = bind("gramatica");		// etiqueta donde ira la gramatica

var LEFT = 0;			// Flags para dirrecion
var RIGHT = 1;
var START = 0;        // Flags para los tres tipos de estado
var ACCEPT = 1;
var REJECT = 2;
var HEAD = 0;			// Flag para posicion del encabezado de linea de un gramatica.txt
var BODY = 1;			// Flag para posicion del cuerpo en un linea de un gramatica.txt
var currentState;            // El estado actual de la maquina
var currentDirection;        // Direction 0 is to the left, 1 to the right
var cinta;                	// La cinta
var pointer;                // Apuntador actual con el indice del caracter que se esta leyendo
var states = {};            // Arreglo con todos los estados
var alfabeto = ['b', '#'];			// Arreglo con el alfabeto de entrada. Por definicion, b y # se agregan.
var lastNode;				// utimo nodo, por si se le quiere agregar mas text.
var list;				// lista con todos los pasos, registrand los cambios de cadena
var ready = false;		// Si esta cargada una gramatica en el sistema

// para recuperar elemntos por id del html
function bind(id) {
  	return document.getElementById(id);
}

// para crear elementos
function make(type) {
	return document.createElement(type);
}

// las reglas de como se lee la cinta
function Rule(charIn, charOut, stateOut, direction) {
    // checar que los caracteres se encuentran en el lenguaje
    if ( !estaAlfabeto(charIn) ) {
        console.log(charIn + " no esta en el alfabeto, problema con el enunciado");
    }

    if ( !estaAlfabeto(charOut) ) {
		console.log(charOut + " no esta en el alfabeto, problema con el enunciado");
    }

    this.charIn = charIn;        // caracter que se lee
    this.charOut = charOut;      // caracter que se deja
    this.stateOut = stateOut;            // estado a donde te vas
    this.direction = direction;    // direcction hacia la que lees; 0 izquierda, 1 derecha
}

// Se leyo el caracter de entrada de esta regla, asi q corre
Rule.prototype.use = function() {
	
	// imprime en la misma linea la regla
	printn("("+ this.stateOut + ", " + this.charOut + ", " + (this.direction === LEFT ? "<--" : "-->") + ")");
	
	console.log("Cambiando " + cinta[pointer] + " por " + this.charOut + ", cambiandose al estado "
	+ this.stateOut + ", y leyendo hacia la " + (this.direction === LEFT ? "izquierda" : "derecha"));
    cinta[pointer] = this.charOut;        // cambia el caracter que esta en la cinta
    currentState = states[this.stateOut];       // cambia el estado
    currentDirection = this.direction;        // cambia la dirrecion
	
	// imprime en la misma linea la cinta
	var s = "| ";
	for (var i in cinta) {
		// Resalta el caracter que estamos editando
		if (i == pointer) {
			s += cinta[i].bold() + " | ";
		} else {
			s += cinta[i] + " | ";
		}
	}
	
	printn("\u00a0\u00a0\u00a0\u00a0" + s + "");
};

// Diferentes estados, cada uno con su nombre individual
function State(nombre) {
    this.nombre = nombre;

    // booleanos que indican que tipos SI son
    this.start = false;
    this.accept = false;
    this.reject = false;

    // Crear el arreglo de reglas
    this.rules = {};
}

// agregar una regla al estado
State.prototype.addRule = function(rule) {
    this.rules[rule.charIn] = rule;     // agrega la regla con el indice siendo el caracter que se lee
};

// que el estado lea el caracter
State.prototype.read = function(char) {
    var rule =  this.rules[char];

    //Verificar q existe una regla, si no dile al usario
    if (rule != null) {
        rule.use();    // encuentra la regla que tiene el caracter de entrada que se mando
        // cada regla bajo cada estado individual es deterministico
    } else {
        console.log("No existe regla para: " + char);
    }


};

// editar el tipo de estado que es, con las banderas
State.prototype.type = function(type) {
    if (type === START) {
        this.start = true;
		currentState = states[this.nombre];		// al ser estado de incio, se vuelve el estado desde donde empieza la maquina
    } else if (type === ACCEPT) {
		if (this.reject) {
			console.log("El estado " + this.nombre + " no puede ser tanto de rechazo como de aceptacion");
			this.reject = false;
		}
		
        this.accept = true;
    } else if (type === REJECT) {
		if (this.accept) {
			console.log("El estado " + this.nombre + " no puede ser tanto de aceptacion como de rechazo");
			this.accept = false;
		}
		
        this.reject = true;
    }
};

// Parses de las gramaticas.txt
function read(content) {
	var lines = content.split("\n");
	var line;
	var i = 0;
	
	states = {};
	alfabeto = ['b', '#'];	
	
	// Regresa la siguente linea de cuerpo del archivo
	var nextBodyLine = function (lines) {
		// Divide linea entre encabezado y cuerpo
		this.line = lines[i++].split(":");
		
		// Si tiene ambos, regresa el cuerpo
		if (this.line.length > 1) {
			for (this.x in this.line) {
				this.line[this.x] = this.line[this.x].replace(/\s+/g, "");
			}
			return this.line[BODY].split(",");
		} else {
			// Divide linea entre comas
			this.line = this.line[HEAD].split(",");
			
			// Si el cuerpo consiste de varias cadenas, regresalas cadena, 
			if (this.line.length > 1) {
				for (this.x in this.line) {
					this.line[this.x] = this.line[this.x].replace(/\s+/g, "");
				}
				return this.line;
			} else {
				// Si el cuerpo es una sola cadena, regresala sin espacios;
				return this.line[HEAD].replace(/\s+/g, "");
			}
		}
	};
	
	// Muestra al gramatica
	gramatica.innerHTML = lines[i++];
	
	// Crea todos los estados
	line = nextBodyLine(lines);
	var state;
	for (var x in line) {
	    state = new State(line[x]) );
		console.log("Agregando estado " + line[x];
	    states[state.nombre] = state;
	}
	
    // Agregar el alfabeto
	line = nextBodyLine(lines);
	for (var x in line) {
		alfabeto[alfabeto.length] = line[x];
	}

    // Agregar categoria de entrada al estado, y ponlo como estado inicial
	line = nextBodyLine(lines);
	for (var x in line) {
		console.log(line[x] + " es estado inicial");
		states[removeSpaces(line[x])].type(START);
	}

    // Agregar categoria de aceptacion al estado
	line = nextBodyLine(lines);
	for (var x in line) {
	    states[removeSpaces(line[x])].type(ACCEPT);
	}

    // Agregar categoria de rechazo al estado
	line = nextBodyLine(lines);
	for (var x in line) {
	    states[removeSpaces(line[x])].type(REJECT);
	}
	
	console.log("Current index:" + i + ", size of lines: " + lines.length);
	var j;
	i++;		// Saltarse el encabezado de las funciones de transicion
	
	// Agregar las funciones de transicion
	while (i < lines.length) {
		j = 0;
		console.log("Adding rule from index " + i + ": " + lines[i]);
		line = nextBodyLine(lines);
		states[removeSpaces(line[j++])].addRule(
			new Rule(
				removeSpaces(line[j++]),
				removeSpaces(line[j++]),
			 	removeSpaces(line[j++]), 
				(removeSpaces(line[j++]) == "RIGHT" ? RIGHT : LEFT)
			)
		);
	}
	
	if (list != null){
		list.remove();
	}
	// recreala,
	list = make("ul");
	
	// y agragala al contenedor
	container.append(list);
	
	
	ready = true;
}


// Verifica que la cadena esta en el lenjuage
function verify() {
	// si la lista existe, borro todos sus elementos
	if (!ready) {
		alert("No existe ninguna gramatica");
		return;
	} 
	
	if (list != null){
		list.remove();
	}
	// recreala,
	list = make("ul");
	
	// y agragala al contenedor
	container.append(list);
	
	// recupera la cadena que el usario nos dio, sin espcaios
	var cadena = t_input.value.replace(/\s+/g, '');
	
	// verifica que la cadena contenga caracteres solo del alfabeto
    if ( cadenaAlfabeto(cadena) ) {
        this.cinta = 'b' + cadena + 'b';		// Guarda la cadena
        var size = cinta.length; 	// Consigue su longitud

        pointer = 1;		// Empieza en el segudno elemento, pues se supone q la cadena empieza con el delimitor b

        // Mientras no estemos en un estado de rechazo,
        // y mientras estemos dentro de los limites de la cadena, corre
        while (!currentState.reject && pointer >= 0 && pointer < size) {
            // Para verificar, imprimir a al consola en que indce estas y en q estado
            console.log("Leyendo del indize " + pointer + ": " + cinta[pointer] + ", en el estado " + currentState.nombre);

			// imprime en una nueva linea el caracter de entrada y el estado actual
			println("( "+ cinta[pointer] + ", " + currentState.nombre + "), ");
			
            // Estado actual, usa tus reglas para leer el caracter actual
            currentState.read(cinta[pointer]);

            // Si la dirrecion de lectura es hacia al derecha, agrega 1 al indice
            // si es haica la izquiera, quitale 1
            if (RIGHT) {
                pointer++;
            } else {
                pointer--;
            }

        }

        // verficar que el estado actual no se uno no terminal
        if (currentState.reject && currentState.accept) {
            console.log("El estado actual no es un estado de rechazo o de aceptacion");
        }
		
		if (currentState.reject) {
			console.log(cadena + " no es parte del lenguaje");
		} else if (currentState.accept) {
			console.log(cadena + " es parte del lenguaje");
		}
		
		// Se acepta la cadena?
		var accepted = !currentState.reject && currentState.accept;
		
		// Muestra al usario si se acepta o rechaza al cadena
		answer.innerHTML = "Cadena" + (accepted ? " " : " no ") + "aceptada";
		
		for (var x in states) {
		    if (states[x].start) {
				console.log("Estado de inicio: " + x);
		    	currentState = states[x];
		    }
		}
    }  else {
		// Muesta al usuario
		answer.innerHTML = "La cadena contiene caracteres que no estan en el alfabeto de entrada";
    }	

}

// Verificar si la cadena esta toda en el alfabeto
function cadenaAlfabeto(cadena) {
	// Empezamos asumiendo q si esta
    var esta = true;
    var i = 0;
	
	// Mientras este la cadena, y sigamos dentro de los limites, sigue buscando
    while (esta && (i < cadena.length) ) {
        esta = estaAlfabeto(cadena[i++]);
    }
	if (!esta) {
		 console.log(cadena + " tiene caracteres que no son parte del alfabeto");
	} else {
		console.log(cadena + " tiene solo caracteres del alfabeto de entrada");
	}
   
   	// regresa el resultado
    return esta;
}

// Verifica si el caracter perteneza al alfabeto
function estaAlfabeto(char) {
	// Empezamos asumiendo q no esta
    var esta = false;
    var i = 0;
	
	// Mientras no este el caracter, y sigamos dentro de los limites, sigue buscando
    while (!esta && (i < alfabeto.length) ) {
        esta = char == alfabeto[i++];
    }
	
    console.log(char + (esta ? " " : " no ") + " es parte del alfabeto");
	
		// regresa el resultado
    return esta;
}

// En el ultimo nodo creado (linea) agrega texto
function printn(string) {
	if (lastNode != null) {
		lastNode.innerHTML += string;
	} else {
		println(string);
	}
}

// Crea un nuevo elemento de lista y agregale texto, creando una nueva linea
function println(string) {
	var li = make("li");
	lastNode = make("span");
	lastNode.innerHTML = string;
	li.appendChild(lastNode);
	list.appendChild(li);
}

function readFile(e) {
	var file  = e.target.files[0];
	if (file) {
		var reader = new FileReader();
		reader.onload = function (inReader) {
			read(inReader.target.result);
		}
		reader.readAsText(file);
	} else {
		alert("Failed to load file");
	}
}



// Lee los estados y reglas
selector.addEventListener("change", readFile, false);

