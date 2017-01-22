#include <sys/mman.h>
#include <unistd.h>

#include "Registers.h"

using namespace v8;

#define REGISTERS_START 0x01c20000
#define REGISTERS_SIZE 0x61000

Nan::Persistent<FunctionTemplate> Registers::constructor_template;

NAN_MODULE_INIT(Registers::Init) {
  Nan::HandleScope scope;

  Local<FunctionTemplate> tmpl = Nan::New<FunctionTemplate>(New);
  constructor_template.Reset(tmpl);

  tmpl->InstanceTemplate()->SetInternalFieldCount(1);
  tmpl->SetClassName(Nan::New("Registers").ToLocalChecked());

  Nan::SetPrototypeMethod(tmpl, "open", Open);
  Nan::SetPrototypeMethod(tmpl, "close", Close);
  Nan::SetPrototypeMethod(tmpl, "read", Read);
  Nan::SetPrototypeMethod(tmpl, "write", Write);

  target->Set(Nan::New("Registers").ToLocalChecked(), tmpl->GetFunction());
}

Registers::Registers() :
  node::ObjectWrap() {

  this->_fd = -1;
  this->_registers = NULL;
}

Registers::~Registers() {
}

void Registers::_open() {
  this->_fd = open("/dev/mem", O_RDWR);

  if (this->_fd != -1) {
    this->_registers = (uint8_t*)mmap(NULL, REGISTERS_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, this->_fd, REGISTERS_START);
  }
}

void Registers::_close() {
  if (this->_registers) {
    munmap(this->_registers, REGISTERS_SIZE);
  }

  close(this->_fd);
}

uint32_t Registers::_read(uint32_t address) {
  uint32_t value = 0;

  if (this->_registers != NULL) {
    uint32_t* r = (uint32_t*)(this->_registers + (address - REGISTERS_START));

    value = *r;
  }

  return value;
}

void Registers::_write(uint32_t address, uint32_t value) {
  if (this->_registers != NULL) {
    uint32_t* r = (uint32_t*)(this->_registers + (address - REGISTERS_START));

    *r = value;
  }
}

NAN_METHOD(Registers::New) {
  Nan::HandleScope scope;

  Registers* p = new Registers();
  p->Wrap(info.This());
  p->This.Reset(info.This());
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(Registers::Open) {
  Nan::HandleScope scope;

  Registers* p = node::ObjectWrap::Unwrap<Registers>(info.This());

  p->_open();

  info.GetReturnValue().SetUndefined();
}

NAN_METHOD(Registers::Close) {
  Nan::HandleScope scope;

  Registers* p = node::ObjectWrap::Unwrap<Registers>(info.This());

  p->_close();

  info.GetReturnValue().SetUndefined();
}

NAN_METHOD(Registers::Read) {
  Nan::HandleScope scope;
  Registers* p = node::ObjectWrap::Unwrap<Registers>(info.This());

  uint32_t value = 0;

  if (info.Length() > 0) {
    Local<Value> arg0 = info[0];

    if (arg0->IsUint32()) {
      uint32_t address = arg0->IntegerValue();

      value = p->_read(address);
    }
  }

  info.GetReturnValue().Set(value);
}

NAN_METHOD(Registers::Write) {
  Nan::HandleScope scope;
  Registers* p = node::ObjectWrap::Unwrap<Registers>(info.This());

  if (info.Length() > 1) {
    Local<Value> arg0 = info[0];
    Local<Value> arg1 = info[1];

    if (arg0->IsUint32() && arg1->IsUint32()) {
      uint32_t address = arg0->IntegerValue();
      uint32_t value = arg1->IntegerValue();

      p->_write(address, value);
    }
  }

  info.GetReturnValue().SetUndefined();
}

NODE_MODULE(binding, Registers::Init);
