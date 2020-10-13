let json = {};
//initialize an empty json object

//initialize a treenode class to hold data
class TreeNode2 {
    //constructors name and data for displaying information
    //parent incase we wanted to backwards traverse
    constructor(name, data, parent) {
        this.name = name;
        this.data = data;
        this.parent = parent;
        this.descendents = {};
    }

    setName(value) {
        this.name = value;
    }
    setData(value) {
        this.data = value;
    }
    setParent(value) {
        this.parent = value;
    }

}

//create a new root object with name: Root, 
let root = new TreeNode2('Root', '', null);

let dataObject = document.createElement('div');

let style = document.createElement('style');

style.textContent = `

ul {
    list-style: none;
    font-size: 14px;
    margin: 5px;
    padding: 0;
}

li {
	display: block;
	padding: 1rem;
	position: relative;
	text-decoration: none;
    transition-duration: 0.5s;
    border: 1px solid black;
    cursor: pointer;
}

ul li ul {
	visibility: hidden;
  opacity: 0;
  min-width: 5rem;
  transition: all 0.5s ease;
  margin-top: 1rem;
	left: 0;
  display: none;
}

.active > ul, .active > ul > li, .active > ul > li > ul{
  visibility: visible;
  opacity: 1;
  display: block;
}

ul li ul li {
	clear: both;
  width: 100%;
}

`;

//custom html component
class TreeNode extends HTMLElement {

    //convert data
    convertData(currentNode, data) {
        //loop over current data on the current node.
        data && Object.keys(data).forEach((x) => {
            //if the data string/number, can make an empty node
            if (typeof data[x] !== 'object') {
                currentNode.descendents[x] = new TreeNode2(x, data[x], currentNode);
            } 
            //if object, recursive the data creating new nodes until the data is all in a base type of string, number or empty
            else {
                //new empty node with just the name
                currentNode.descendents[x] = new TreeNode2(x, [], currentNode);
                //set a new pointer node
                let tempNode = currentNode.descendents[x];
                //loop over the object data pointing to temp node
                this.convertData(tempNode, data[x]);
            }
    
        })
    }
    
    //check if the component is expanded
    get expand() {
        return this.hasAttribute('expand');
    }

    get node() {
        return this.getAttribute('node');
    }

    get parent() {
        return this.getAttribute('parent');
    }
    set parent(value) {
        this.setAttribute('parent', value);
    }
    setName(value) {
        this.name = value;
    }
    setData(value) {
        this.data = value;
    }
    setParent(value) {
        this.parent = value;
    }
    setChildren(vlaue) {
        this.children = value;
    }
    
    //set the expand option for component
    set expand(val) {
        if(val) {
            this.setAttribute('expand', '');
        } else {
            this.removeAttribute('expand');
        }
    }


    generateChildren(startNode) {
        let main = startNode; 
        
        let ul = document.createElement('ul');
        let li = document.createElement('li');
        let name = document.createElement('h3');
        name.innerText = 'Name: ' + main.name;
        li.append(name);
        ul.append(li);
        let li2 = document.createElement('li');
        let data = document.createElement('h5');
        data.innerText = 'Data: ' + main.data;
        li2.append(data);
        ul.append(li2);
    
        if (Object.keys(main.descendents).length > 0) {
            let ul2 = document.createElement('ul');
            Object.keys(main.descendents).forEach((x) => {
                let li3 = document.createElement('li');
                li3.append(this.generateChildren(main.descendents[x]));
                ul2.append(li3);
            })
            let li4 = document.createElement('li');
            let info = document.createElement('h5');
            info.innerText = 'Expand Children \n';
            li4.append(info);
            li4.append(ul2);
            li4.addEventListener('click', function() {
                if (this.className.includes('active')) {
                    return this.className.replace(" active", "");
                }
                this.className += " active";
            })
            ul.append(li4);
        }
    
        return ul;
    }

    startChildGeneration(startNode) {
        let x = this.generateChildren(startNode);
        this.shadowRoot.querySelector('ul') ? this.shadowRoot.querySelector('ul').remove() : null;
        this.shadowRoot.append(x);
    }

    //switch the expand position by checking if it already exists
    switchExpand() {
        if(this.hasAttribute('expand')) {
            this.removeAttribute('expand');
        } else {
            this.setAttribute('expand', '')
        }
    } 

    constructor() {
        super();
        // attaches shadow tree and returns shadow root reference
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
        const shadow = this.attachShadow({ mode: 'open' });
        const container = document.createElement('main');
        const children = this.children;

        this.submitURL = this.submitURL.bind(this);
        this.convertData = this.convertData.bind(this);
        this.generateChildren = this.generateChildren.bind(this);

        shadow.append(container);
        shadow.appendChild(style);
    }

    submitURL(urlInput) {

        this.setData(urlInput);
        this.setName(root);
        this.setParent('null');
        
        //fetch the json
        fetch(urlInput)
            .then(
                (response) => {
                    //if error, console log it
                    if (response.status !== 200) {
                        console.log('Error ' + response.status);
                        return;
                    }
                
                    //convert to json and move onto next function
                    response.json().then((data) => {
                        console.log(data);
                        //move data to json object
                        json = data;
                        //set the parent of the tree-node object to be null
                        //convert json to a tree starting with the root node
                        this.convertData(root, json);

                        console.log(root);
                        
                        //start generating children
                        this.startChildGeneration(root);
                        
                    });
                }
            )
            //catch other errors
            .catch((err) => {
                console.log('Fetch Error', err);
            });

    }

    // fires after the element has been attached to the DOM
    connectedCallback() {
        const urlButton = this.shadowRoot.querySelector('.submit-button');
    }
  
}

function urlSubmit() {
    let url = document.querySelector('#url').value;
    document.querySelector('#root').submitURL(url);
}


//define the node
customElements.define('tree-node', TreeNode);
