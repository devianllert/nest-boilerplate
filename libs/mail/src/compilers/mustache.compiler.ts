import path from 'path';
import { readFileSync } from 'fs';
import { compile, Renderer } from 'micromustache';

import { MailOptions, TemplateCompiler, Template } from '../interfaces/mailOptions.interface';

export class MustacheCompiler implements TemplateCompiler {
  private precompiledTemplates: { [name: string]: Renderer } = {};

  private precompile(template: string, fn: Function, options?: Template) {
    const templateExt = path.extname(template) || '.html';
    const templateName = path.basename(template, path.extname(template));
    const templateDir = path.dirname(template) !== '.' ? path.dirname(template) : options?.dir ?? '';
    const templatePath = path.join(templateDir, templateName + templateExt);

    if (!this.precompiledTemplates[templateName]) {
      try {
        const templateFile = readFileSync(templatePath, {
          encoding: 'utf-8',
        });

        this.precompiledTemplates[templateName] = compile(templateFile);
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

  public compile(mail: any, callback: Function, mailOptions: MailOptions): void {
    const { templateName } = this.precompile(mail.data.template, callback, mailOptions.template);

    const rendered = this.precompiledTemplates[templateName].render(mail.data.context);

    // eslint-disable-next-line no-param-reassign
    mail.data.html = rendered;

    return callback();
  }
}
