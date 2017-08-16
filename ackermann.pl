ackermann(0,N,X) :- X is N+1.
ackermann(M, 0, X) :- M>0, M1 is M-1, ackermann(M1, 1, X).
ackermann(M, N, X) :- M>0, N>0, M1 is M-1, N1 is N-1, ackermann(M, N1, X1), ackermann(M1, X1, X).