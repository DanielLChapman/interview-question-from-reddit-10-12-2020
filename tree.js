let json = {};
let style = document.createElement('style');

//code from : https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
//generates a random id for checkbox id later on
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

//initialize a treenode class to hold data
class TreeNode {
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

//generate the root
let root = new TreeNode('Root', '', null);

//style to reach shadow-root
//checkbox checking for collapsing tree nodes
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

.checkbox-for-expansion:checked ~ ul, .checkbox-for-expansion:checked  ~ ul > li, .checkbox-for-expansion:checked  ~ ul > li > ul{
  visibility: visible;
  opacity: 1;
  display: block;
}

ul li ul li {
	clear: both;
  width: 100%;
}
.for-checkbox {
    color: black;
    width: 100%;
    height: 100%;
    display: inline-block;
    min-height: 100%;
    height: 100%;
    cursor: pointer;

}

input[type="checkbox"] {
    display: none;
}


`;

//Main view with input for url
class MainView extends HTMLElement {
    //this will contain the url grabbing

    constructor() {
        super();
        // attaches shadow tree and returns shadow root reference
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
        const shadow = this.attachShadow({ mode: 'open' });
        const container = document.createElement('main');

        container.innerHTML = `
        <section class="url">
            <label for="url">
                URL: 
                <input type="text" id="url" value="https://breakingbadapi.com/api/characters" />
            </label>
            <input type="submit" value="Submit" class="submit-button">
        </section>

        <tree-view>
        </tree-view>
        `;


        shadow.append(container);
        shadow.appendChild(style);
    }

    // fires after the element has been attached to the DOM
    // connects the url to the actual tree to run JSON
    connectedCallback() {
        const urlButton = this.shadowRoot.querySelector('.submit-button');
        urlButton.addEventListener('click', () => {
            this.shadowRoot.querySelector('tree-view').submitURL(this.shadowRoot.querySelector('#url').value);
        }, false);
    }



}

class Tree extends HTMLElement {

    get url() {
        return this.attributes(url);
    }

    set url(value) {
        this.setAttribute('url', value);
    }

    url(value) {
        this.url = value;
    }

    //convert data
    convertData(currentNode, data) {
        //loop over current data on the current node.
        data && Object.keys(data).forEach((x) => {
            //if the data string/number, can make an empty node
            if (typeof data[x] !== 'object') {
                currentNode.descendents[x] = new TreeNode(x, data[x], currentNode);
            } 
            //if object, recursive the data creating new nodes until the data is all in a base type of string, number or empty
            else {
                //new empty node with just the name
                currentNode.descendents[x] = new TreeNode(x, [], currentNode);
                //set a new pointer node
                let tempNode = currentNode.descendents[x];
                //loop over the object data pointing to temp node
                this.convertData(tempNode, data[x]);
            }
    
        })
    }

    submitURL(urlInput) {

        //set the root data to the url so its visible to the user.
        root.setData(urlInput);

        
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

    //since generate children is recursive, wanted another method to start the call and append it when its done
    startChildGeneration(startNode) {
        let x = this.generateChildren(startNode);
        this.append(x);
    }

    //generates nodes based on the template in the html document
    generateChildren(startNode) {

        //starting node
        let main = startNode; 
        
        //grab the template and clone it
        let treeNodeTemplate = document.querySelector('#tree-node-template');
        let content = treeNodeTemplate.content.cloneNode(true);

        //fill the data in
        content.querySelector('.name h3').innerText = 'Name: ' + main.name;
        content.querySelector('.data h5').innerText = 'Data: ' + main.data;

        //if there are descendents we want to create a checkbox + label so that it can appear
        //Also we need to make the actual children which is called recursively.
        //Other option would be to create two different templates and just edit the ID value as well
        if (Object.keys(main.descendents).length > 0) {

            //children creation
            let ul = document.createElement('ul');
            Object.keys(main.descendents).forEach((x) => {
                let li = document.createElement('li');
                li.append(this.generateChildren(main.descendents[x]));
                ul.append(li);
            })


            //checkbox creation
            let id = makeid(25);
            let label = document.createElement('label');
            label.htmlFor = id;
            label.classList.add('for-checkbox');
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = "name";
            checkbox.value = "value";
            checkbox.id = id;
            checkbox.classList.add('checkbox-for-expansion');

            //append h5 to label
            let info = document.createElement('h5');
            info.innerText = 'Expand Children \n';
            label.append(info);

            //append all children + label + checkbox to the dom object
            content.querySelector('.descendents').append(label);
            content.querySelector('.descendents').append(checkbox);
            content.querySelector('.descendents').append(ul);
        } else {
            //remove the descendents if its not needed
            content.querySelector('.descendents').remove();
        }

        //return the giant dom code so it can be attached
        return content;
    }
}


//define the node
customElements.define('main-view', MainView);
//define the node
customElements.define('tree-view', Tree);
