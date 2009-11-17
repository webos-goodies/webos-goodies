//
//  Shader.fsh
//  GLSample1
//
//  Created by 伊藤 千光 on 09/11/17.
//  Copyright __MyCompanyName__ 2009. All rights reserved.
//

varying lowp vec4 colorVarying;

void main()
{
	gl_FragColor = colorVarying;
}
