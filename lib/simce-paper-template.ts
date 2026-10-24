/** Fixed A4 answer-sheet coordinates in millimetres, relative to fiducial centres. */
export const SIMCE_PAPER_MM={
  width:186,height:273,
  fiducialLeft:8,fiducialRight:178,fiducialTop:8,fiducialBottom:265,
  firstLeftX:30,firstRightX:113,firstY:55,
  optionStep:10,rowStep:7.6,bubbleDiameter:6,
} as const;
export function simcePaperCalibration(){
 const p=SIMCE_PAPER_MM;
 const w=p.fiducialRight-p.fiducialLeft,h=p.fiducialBottom-p.fiducialTop;
 return {
  leftX:(p.firstLeftX-p.fiducialLeft)/w,
  rightX:(p.firstRightX-p.fiducialLeft)/w,
  leftY:(p.firstY-p.fiducialTop)/h,
  rightY:(p.firstY-p.fiducialTop)/h,
  spacing:p.optionStep/w,rowSpacing:p.rowStep/h,
  radius:(p.bubbleDiameter/2)/w,
  leftRows:20
 };
}
