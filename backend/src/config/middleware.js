import cookieParser from 'cookie-parser';
import express from 'express';

export const setupMiddleware = (app) => {
  // Body parsing middleware
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '10mb' }));
};
