const mirrorTransform = require('../src/').mirrorTransform;

describe('mirrorTransform()', () => {
  it('should return a mirrorTransformed string', () => {
    expect(mirrorTransform('foo bar')).toEqual('ɹɐq ooɟ');
  });

  it('should return a mirrorTransformed string with trailing space', () => {
    expect(mirrorTransform('foo ')).toEqual(' ooɟ');
  });

  it('should not mangle a placeholder', () => {
    expect(mirrorTransform('foo %(whatever)s')).toEqual('%(whatever)s ooɟ');
  });

  it('should not mangle a curly brace placeholder', () => {
    expect(mirrorTransform('Abuse Reports for {addon} ({num})')).toEqual('({num}) {addon} ɹoɟ sʇɹodǝᴚ ǝsnq∀');
  });

  it('should not mangle a word wrapped with square brackets', () => {
    expect(mirrorTransform('Square braces should [work]')).toEqual('[ʞɹoʍ] pʅnoɥs sǝɔɐɹq ǝɹɐnbS');
  });

  it('should not mangle HTML', () => {
    expect(mirrorTransform('foo <a href="#whatevs">bar</a>')).toEqual('<a href="#whatevs">ɹɐq</a> ooɟ');
  });

  it('should not mangle more complex HTML', () => {
    expect(mirrorTransform('foo <a href="#whatevs">bar <span>test</span></a>'))
      .toEqual('<a href="#whatevs"><span>ʇsǝʇ</span> ɹɐq</a> ooɟ');
  });
});
