'use strict';

goog.provide('Blockly.ProcedureMap');

Blockly.ProcedureMap = function(workspace) {
  this.procedureMap_ = new Object(null);
  this.workspace = workspace;
};

Blockly.ProcedureMap.prototype.clear = function() {
  this.procedureMap_ = new Object(null);
};

Blockly.ProcedureMap.prototype.createProcedureMutation = function(mutation) {
  var proccode = mutation.getAttribute('proccode');
  if (proccode) {
    this.procedureMap_[proccode] = mutation;
  }
};

Blockly.ProcedureMap.prototype.deleteProcedureMutationByProccode = function(proccode) {
  if (this.procedureMap_[proccode]) {
    delete this.procedureMap_[proccode];
  }
};

Blockly.ProcedureMap.prototype.getAllProcedureMutations = function() {
  return Object.values(this.procedureMap_);
};

Blockly.ProcedureMap.prototype.getProcedureMutationByProccode = function(proccode) {
  return this.procedureMap_[proccode];
};
