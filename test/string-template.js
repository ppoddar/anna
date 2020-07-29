const templateString = "Hello ${this.name}!";
const templateVars = {
    name: "world"    
}

const fillTemplate = function(templateString, templateVars){
    return new Function("return `"+templateString +"`;").call(templateVars);
}

console.log(fillTemplate(templateString, templateVars))