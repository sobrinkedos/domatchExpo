module.exports = function (plop) {
  plop.setGenerator('component', {
    description: 'Create a new component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name?'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Component type?',
        choices: ['functional', 'class']
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'components/{{pascalCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'templates/component.tsx.hbs'
      },
      {
        type: 'add',
        path: 'components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
        templateFile: 'templates/component.test.tsx.hbs'
      },
      {
        type: 'add',
        path: 'components/{{pascalCase name}}/index.ts',
        templateFile: 'templates/component.index.ts.hbs'
      }
    ]
  });
};
