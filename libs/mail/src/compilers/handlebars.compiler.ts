import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import glob from 'glob';

import { MailOptions, TemplateCompiler, Template } from '../interfaces/mailOptions.interface';

export class HandlebarsCompiler implements TemplateCompiler {
  private precompiledTemplates: { [name: string]: handlebars.TemplateDelegate } = {};

  constructor() {
    handlebars.registerHelper('concat', (...args) => {
      args.pop();
      return args.join('');
    });
  }

  private precompile(template: string, fn: Function, options?: Template) {
    const templateExt = path.extname(template) || '.hbs';
    const templateName = path.basename(template, path.extname(template));
    const templateDir = path.dirname(template) !== '.' ? path.dirname(template) : options?.dir ?? '';
    const templatePath = path.join(templateDir, templateName + templateExt);

    if (!this.precompiledTemplates[templateName]) {
      try {
        const templateFile = fs.readFileSync(templatePath, {
          encoding: 'utf-8',
        });

        this.precompiledTemplates[templateName] = handlebars.compile(templateFile, options?.options);
      } catch (err) {
        return fn(err);
      }
    }

    return {
      templateExt,
      templateName,
      templateDir,
      templatePath,
    };
  }

  public compile(mail: any, callback: any, mailOptions: MailOptions): void {
    const { templateName } = this.precompile(mail.data.template, callback, mailOptions.template);

    const runtimeOptions = mailOptions.options ?? {};

    if (runtimeOptions.partials) {
      const files = glob.sync(path.join(runtimeOptions.partials.dir, '*.hbs'));

      files.forEach((file) => this.precompile(file, () => {}, runtimeOptions.partials));
    }

    const rendered = this.precompiledTemplates[templateName](mail.data.context, {
      ...runtimeOptions,
      partials: this.precompiledTemplates,
    });

    // eslint-disable-next-line no-param-reassign
    mail.data.html = rendered;

    return callback();
  }
}
